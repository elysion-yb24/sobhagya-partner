// import ComponentsDatatablesAdvanced from '@/components/datatables/components-datatables-advanced.jsx';
import ComponentTeamUserTable from '@/components/team/components-team-user-table.jsx'
import React from 'react';
import { cookies } from 'next/headers'
import { getAdminUsers } from '@/utils';

export const metadata = {
    title: 'Admin Users List',
};

async function page() {
    const access_token=cookies().get('access_token')?.value
    const refresh_token=cookies().get('token')?.value;

    const apiData=await getAdminUsers('/auth/api/team/get-team-users?',access_token,refresh_token)
    const userData=apiData?.data?.map((user,index)=>({...user,id:index+1}))
    return <div>
        {apiData && <ComponentTeamUserTable userData={userData} data={apiData}/>}
    </div>
}
export default page;
