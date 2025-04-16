// app/api/admin/astrologers/[id]/onboard/route.js

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import User from "@/models/user";
import Auth from "@/models/auth";
import Kyc from '@/models/kyc';
import crypto from "crypto";

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const astrologer = await Astrologer.findById(id);
    const kyc=await Kyc.findOne({astrologerId:astrologer._id});

    if (!astrologer) throw new Error('No astrologer exists with this Id.');

    if(!astrologer.isKycDone) throw new Error('Kyc is not completed');

    if(!astrologer.isDetailsFilled) throw new Error('Details are not filled');

    if(!astrologer.audioPrice || !astrologer.videoPrice || !astrologer.displayAudioPrice || !astrologer.displayVideoPrice) throw new Error('Prices are not set')

    if(astrologer.leadStatus === "onboarded" || astrologer.leadStatus === "rejected") throw new Error('Astrologer already onboarded or rejected');

    let user = await User.findOne({phone: astrologer.phone});
    if(user) throw new Error('User Already Exists with this phone.');

    let auth=await Auth.findOne({phone:astrologer.phone});

    if(auth) await Auth.DeleteOne({phone:astrologer.phone});

    user =new User({
      _id:astrologer?._id,
      numericId: crypto.randomBytes(4).readUInt32BE(0, true),
      phone: astrologer?.phone,
      name: astrologer?.name,
      role: "friend",
      age:astrologer?.yearsOfExperience,
      avatar:kyc?.displayPic,
      language:astrologer?.languages,
      talksAbout:astrologer?.specializations,
      status:"offline",
      rpm:astrologer?.displayAudioPrice,
      videoRpm:astrologer?.displayVideoPrice,
      payoutAudioRpm:astrologer?.audioPrice,
      payoutVideoRpm:astrologer?.videoPrice,
    })

    auth=new Auth({
      _id:astrologer._id,
      phone: astrologer.phone,
      role:"friend"
    })

    await user.save();
    await auth.save();

    astrologer.leadStatus = "onboarded";
    await astrologer.save();

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Astrologer ${id} has been Onboarded.`,
      }),
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error onboarding astrologer:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message, data: null }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

// ✅ Handle OPTIONS method for CORS Preflight Requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
