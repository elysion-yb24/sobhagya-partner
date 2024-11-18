import ComponentPaymentDetails from '@/components/payment-details/component-payment-details';
import { getPaymentsList } from '@/utils';
import { cookies } from 'next/headers';
async function page() {
    const access_token = cookies().get('access_token')?.value
    const token=cookies().get('token')?.value
    const paymentListData=await getPaymentsList('/user/api/admin/list-to-approve-payment-details',access_token,token)
    return (
        <div>
            <ComponentPaymentDetails paymentDetails={paymentListData}/>
        </div>
    );
}

export default page;