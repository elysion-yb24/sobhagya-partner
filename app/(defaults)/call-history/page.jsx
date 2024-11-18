import ComponentCallHistory from '@/components/call-history/component-call-history'
import ComponentReadCalls from '@/components/calls/components-read-calls'
import ComponentReadTransactions from '@/components/transactions/components-read-transactions'
import { buildQuery, getAdminCallsApi, getTransactionsApi } from '@/utils'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
async function page({
    searchParams,
}) {
    const access_token = cookies().get('access_token')?.value
    const refresh_token = cookies().get('token')?.value

   
    const queryString = buildQuery(searchParams)
    // console.log(queryString,"querystring")
    const transactionsData = await getTransactionsApi(`/payment/api/admin/get-transactions-admin?${queryString}`, access_token, refresh_token)
    const callsData=await getAdminCallsApi(`/calling/api/admin/get-calls-admin?${queryString}`,access_token,refresh_token)
    
    console.log(transactionsData);
    console.log('callsdat',callsData)
    if (transactionsData?.data && !Array.isArray(transactionsData.data)) transactionsData.data = [transactionsData.data]
    if(callsData?.data && !Array.isArray(callsData.data)) callsData.data=[callsData.data]
    // console.log('callsData',callsData);
    return (
        <ComponentCallHistory callsData={callsData} transactionsData={transactionsData} />
        
    );

}
export default page;