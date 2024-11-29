'use client'

import { addUser } from "@/store/userSlice";
import { changePartnerStatus, get, getStats, post } from "@/utils";
import { set } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import Cookies from "universal-cookie";
import Loading from "../layouts/loading";

function SobhagyaDashboard() {
    const data = useSelector((state) => state.user.data)
    const [statsData, setStatsData] = useState(null);
    const [totalAmount, setTotalAmount] = useState(null);
    const dispatch = useDispatch();
    const [disableStatusButton, setdisableStatusButton] = useState(false)
    const [disableVideoCallButton, setdisableVideoCallButton] = useState(false)
    const cookies = new Cookies(null, { path: '/' })
    const router = useRouter();
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    })
    const handleChangeStatus = async (status) => {
        try {
            const access_token = cookies.get('access_token')
            if (!status) throw new Error('Status Required');
            status = status.toLowerCase();
            setdisableStatusButton(true);
            let result = await post('/change-status', access_token, { status: status == "offline" ? "online" : "offline" });
            if (result.success) {
                Toast.fire({
                    icon: 'success',
                    title: status == "offline" ? "You are now Online" : "You are now Offline",
                })
                dispatch(addUser({ ...data, status: status == "offline" ? "online" : "offline" }))
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'Something went wrong',
                })
            }
        } catch (err) {
            console.log(err)
        } finally {
            setdisableStatusButton(false)
        }
    }
    const handleChangeVideoStatus = async (isVideoCallAllowedAdmin, isVideoCallAllowed) => {
        try {
            setdisableVideoCallButton(true);
            if (!isVideoCallAllowedAdmin) {
                Toast.fire({
                    icon: 'error',
                    title: 'Video Call Not Enabled!',
                })
                return
            }
            const access_token = cookies.get('access_token')
            let result = await post('/change-status-video', access_token, { status: !isVideoCallAllowed });
            if (result.success) {
                Toast.fire({
                    icon: 'success',
                    title: !isVideoCallAllowed ? "Your Video Call is on Now" : "Your Video Call is off Now",
                })
                dispatch(addUser({ ...data, isVideoCallAllowed: !isVideoCallAllowed }))
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'Something went wrong',
                })
            }


        } catch (err) {
            Toast.fire({
                icon: 'error',
                title: 'Something went wrong',
            })
            console.log(err)
        } finally {
            setdisableVideoCallButton(false)
        }
    }

    const getStatsData = async () => {
        try {
            const result = await get('/stats', cookies.get('access_token'))
            if (result.success) {
                setStatsData(result?.data);
            } else {
                setStatsData([{
                    amountEarned: 0
                }]);
            }
        } catch (err) {
            console.log('Error in getTransactionData', err)
        }

    }
    const getTransactionData = async () => {
        try {
            const result = await get('/pay/wallet', cookies.get('access_token'))
            if (result.success) {
                setTotalAmount(result?.data?.balance);
            }
        } catch (err) {
            console.log('Error in getTransactionData', err)
        }

    }

    useEffect(() => {
        if(data){
            if (!statsData) getStatsData();
            if (!totalAmount) getTransactionData();
        }
    }, [data]);

    if (!data) return <Loading />
    return (
        <div className="max-w-[400px] m-auto  h-full">
            <div className="flex items-center justify-between w-full">

                <span className="font-bold">You are now
                    {
                        data?.status.toLowerCase() == "offline" ?
                            <span className="rounded bg-danger-light p-1 mx-2 text-danger">{data?.status.toUpperCase()}</span>
                            :
                            <span className="rounded bg-success-light p-1 mx-2  text-success">{data?.status.toUpperCase()}</span>
                    }
                </span>
                <div className="w-12 h-6 relative">
                    <input
                        type="checkbox"
                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer form-checkbox"
                        id="isVideoCallAllowedAdmin"
                        name="isVideoCallAllowedAdmin"
                        checked={data?.status.toLowerCase()=="online"}
                        onChange={(e)=>handleChangeStatus(data?.status)}
                    />
                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                </div>
                {/* <button className="btn btn-primary my-2 p-1" onClick={() => handleChangeStatus(data?.status)} disabled={disableStatusButton}>Go {data?.status == "offline" ? "ONLINE" : "OFFILNE"}</button> */}
            </div>

            <span>Note : By going offline,you won't be receiving any calls.</span>

            <div className={`flex items-center justify-between w-full my-2`}>
                <span className="font-bold">Your video call is {data?.isVideoCallAllowed ? "ON" : "OFF"}</span>
                <div className="w-12 h-6 relative">
                    <input
                        type="checkbox"
                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer form-checkbox"
                        id="isVideoCallAllowedAdmin"
                        name="isVideoCallAllowedAdmin"
                        checked={data?.isVideoCallAllowed}
                        onChange={(e)=>handleChangeVideoStatus(data?.isVideoCallAllowedAdmin,data?.isVideoCallAllowed)}
                    />
                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                </div>
                {/* <button className="btn btn-primary my-2 p-1 text-sm/4" disabled={disableVideoCallButton} onClick={(e) => handleChangeVideoStatus(data?.isVideoCallAllowedAdmin, data?.isVideoCallAllowed)}>Turn {data?.isVideoCallAllowed ? "OFF" : "ON"} Video Call</button> */}
            </div>


            <div className="my-4 flex flex-col w-full">
                <span className="inline">Amount Earned</span>
                <span className="font-bold inline text-lg">₹{totalAmount}</span>
            </div>

            <div className="flex flex-wrap justify-between gap-4 my-8 bg-gray-100 rounded-md dark:bg-dark-dark-light dark:text-dark-white">
                <Boxes title={"Average Rating"} description={data?.rating?.avg} isRating={true} />
                <Boxes title={"Call time Spent"} description={data?.callMinutes + " mins"} isRating={false} />
                <Boxes title={"Earned Today"} description={"₹ " + ((statsData && statsData.length > 0) ? statsData[0]?.amountEarned : 0)} isRating={false} />
            </div>

            <div className="flex flex-wrap w-full justify-between gap-4">
                <div>
                    <span className="flex flex-col gap-2">Payout Audio Rpm</span>
                    <span className="font-bold inline text-lg">₹{data?.payoutAudioRpm}</span>
                </div>
                <div className="flex flex-col ">
                    <span className="flex flex-col gap-2">Payout Video Rpm</span>
                    <span className="font-bold inline text-lg">₹{data?.payoutVideoRpm}</span>
                </div>
            </div>


        </div>
    );
}

export default SobhagyaDashboard;

function Boxes({ title, description, isRating }) {
    let isActive = 0
    if (isRating) {
        isActive = Math.floor(Number(description));
    }
    return (
        <div className="flex items-center justify-between border-2 border-gray-400 w-[45%] min-h-[100px] bg-white rounded-md dark:bg-dark-dark-light dark:text-dark-whitet">
            <div className="flex flex-col justify-center items-center m-auto p-4 text-center text-sm">
                <span className="font-bold">{title}</span>
                {isRating ?
                    <div className="flex items-center">
                        {
                            Array(5).fill('_').map((_, idx) => {
                                return <svg className={`w-4 h-4 ${idx < isActive ? 'text-primary' : 'text-gray-500'} me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg`} fill="currentColor" viewBox="0 0 22 20" key={idx}>
                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                </svg>
                            }
                            )
                        }
                    </div>
                    :
                    <span className="">{description}</span>
                }
            </div>
        </div>
    )
}

