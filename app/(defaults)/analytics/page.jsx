import ComponentPartnerAnalytics from '@/components/dashboard/components-partner-analytics';
import { buildQuery, getPartnerAnalytics } from '@/utils';
import { cookies } from 'next/headers';

async function page ({
    searchParams
}){

    const access_token = cookies().get('access_token')?.value
    const refresh_token=cookies().get('token')?.value

    const queryString=buildQuery(searchParams)
    
    let analyticsData=await getPartnerAnalytics(`/payment/api/transaction/partner-analytics?${queryString}`,access_token,refresh_token);
    let errorMessage='';
    if(analyticsData?.success===false){
        errorMessage=analyticsData?.message
    }
    analyticsData=analyticsData?.data || [];
    
    analyticsData=analyticsData?.map((data)=>{
        let updatedData={...data}
        if(data.freeCallsCount==0) updatedData= {...updatedData,conversionPercent:-1}
        else updatedData= {...updatedData,conversionPercent:(data.convertedLeads/data.freeCallsCount*100).toFixed(2)}

        if(data.freeCallsCount===0 && data.paidCallsCount===0) updatedData= {...updatedData,missedCallsPercent:0}
        else updatedData= {...updatedData,missedCallsPercent:(data.missedCallsCount/(data.missedCallsCount+data.freeCallsCount+data.paidCallsCount)*100).toFixed(2)}
        return updatedData;
    })
    return <ComponentPartnerAnalytics analyticsData={analyticsData} errorMessage={errorMessage}/>;
};

export default page;
