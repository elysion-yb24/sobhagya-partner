import { buildQuery, getTransactionsApi } from "@/utils";
import {cookies } from "next/headers";
import ComponentReadTransactions from "@/components/transactions/components-read-transactions";

async function page({
    searchParams,
}) {
    const access_token = cookies().get('access_token')?.value
    const refresh_token=cookies().get('token')?.value

    if(!searchParams.skip || !searchParams.limit){
        if(!searchParams.skip) searchParams.skip=0
        if(!searchParams.limit) searchParams.limit=10
    }
    
    const queryString=buildQuery(searchParams)
    const transactionsData=await getTransactionsApi(`/payment/api/admin/get-transactions-admin?${queryString}`,access_token,refresh_token)

    console.log("🚀 ~ apiData before:", transactionsData)
    if(transactionsData?.data && !Array.isArray(transactionsData.data)) transactionsData.data=[transactionsData.data]
    // console.log("🚀 ~ apiData after:", transactionsData)
    return (
       <ComponentReadTransactions transactionsData={transactionsData} searchParams={searchParams}/>
    );
}

export default page;