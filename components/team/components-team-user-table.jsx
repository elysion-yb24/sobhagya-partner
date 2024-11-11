'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import ComponentTeamPermissionModal from '@/components/team/components-team-permissions-modal';
import ComponentTeamPermissionRole from '@/components/team/components-team-role-modal';


const ComponentTeamUserTable = ({userData,data}) => {

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(userData|| []);
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const roleStatusColor = (role) => {
        const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
        role = role.toLowerCase();
        if (role === "admin") return color[0];
        else if (role === "regionalmanager") return color[1];
        else return color[3];
    };


    return (
        <div className="panel mt-6">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Team Members List</h5>
            <div className="datatables">
                {isMounted && (
                    <DataTable
                        noRecordsText="No results match your search query"
                        highlightOnHover
                        className="table-hover whitespace-nowrap"
                        records={initialRecords}
                        columns={[
                            {
                                accessor: '_id',
                                title: 'ID',
                                sortable: true,
                                render: ({id}) => <strong className="text-info">#{id}</strong>,
                            },
                            {
                                accessor: 'name',
                                title: 'User',
                                sortable: true,
                                render: ({ name }) => (
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{name}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'email',
                                title: 'Email',
                                sortable: true,
                                render: ({ email }) => (
                                    <a href={`mailto:${email}`} className="text-primary hover:underline">
                                        {email}
                                    </a>
                                ),
                            },
                            {
                                accessor: 'role',
                                title: 'Current Role',
                                render: ({ role }) => <span className={`badge badge-outline-${roleStatusColor(role)} `}>{role===''?'Not assigned':role}</span>,
                            },

                            {
                                accessor: 'permissions',
                                title: 'Permissions',
                                render: ({permissions,_id}) => <ComponentTeamPermissionModal permissions={permissions} userId={_id}/>
                            },
                            {accessor:'currentRole',title:'Manage Role',render:({_id,role})=><ComponentTeamPermissionRole userId={_id} role={role}/>}
                        ]}
                        totalRecords={initialRecords.length}
                        idAccessor='_id'
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        emptyState={<>{data?.message}</>}
                    />
                )}
            </div>
        </div>
    );
};

export default ComponentTeamUserTable;
