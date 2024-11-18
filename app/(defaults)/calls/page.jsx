import { buildQuery, getAdminCallsApi } from "@/utils";
import {cookies } from "next/headers";
import ComponentReadCalls from '@/components/calls/components-read-calls'

async function page({
    searchParams,
}) {
    const access_token = cookies().get('access_token')?.value
    const refresh_token=cookies().get('token')?.value
    
    const queryString=buildQuery(searchParams)
    const callsData=await getAdminCallsApi(`/calling/api/admin/get-calls-admin?${queryString}`,access_token,refresh_token)

    // console.log("🚀 ~ apiData before:", callsData)
    if(callsData?.data && !Array.isArray(callsData.data)) callsData.data=[callsData.data]
    // console.log("🚀 ~ apiData after:", callsData)
    return (
       <ComponentReadCalls callsData={callsData} searchParams={searchParams}/>
    );
}

export default page;