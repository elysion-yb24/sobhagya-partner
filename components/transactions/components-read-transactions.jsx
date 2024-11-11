'use client'
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Select from 'react-select'
import ComponentTransactionsTable from '@/components/transactions/components-transaction-table';

function ComponentReadTransactions({ transactionsData }) {
    // console.log("transactionsData.success", transactionsData?.success)
    // const [page, setPage] = useState(1);
    // const PAGE_SIZES = [10, 20, 30, 50, 100];
    // const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    // const [recordsData, setRecordsData] = useState(initialRecords);
    const [isLoading, setLoading] = useState(false)
    const [initialRecords, setInitialRecords] = useState(transactionsData.data || []);
    const isRtl = useSelector((state) => state.themeConfig.rtlClass) === 'rtl';
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        userId: searchParams.get('userId') || '',
        paymentFor: searchParams.get('paymentFor') || '',
        channelId: searchParams.get('channelId') || '',
        status: searchParams.get('status') || '',
        transactionId: searchParams.get('transactionId') || '',
        skip: Number(searchParams.get('skip')) || 0,
        limit: 10
    })
    const { push, replace } = useRouter();
    const pathname = usePathname();

    const paymentForOptions = [
        { value: 'call', label: 'Call' },
        { value: 'gift', label: 'Gift' },
        { value: 'video', label: 'Video' },
        { value: 'recharge', label: 'Recharge' },
        {value:'penalty-missedcall',label:'Penalty-Missed Call'},
        { value: '', label: 'All' }
    ];

    const handleQuery = (paramsFormData) => {
        try {
            setLoading(true)
            const params = new URLSearchParams(searchParams)
            for (let key in paramsFormData) {
                params.set(key, paramsFormData[key])
            }
            push(`${pathname}?${params.toString()}`, { scroll: false })
            setTimeout(() => {
                setLoading(false)
            }, 1000)
        } catch (err) {
            alert('err', err)
            setLoading(false)
        }
    }

    

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedFormData = { ...formData, "skip": 0 }
        handleQuery(updatedFormData);
    }
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: 'id',
        direction: 'asc',
    });


    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setInitialRecords(transactionsData.data || [])
        setFormData({
            from: searchParams.get('from') || '',
            to: searchParams.get('to') || '',
            userId: searchParams.get('userId') || '',
            paymentFor: searchParams.get('paymentFor') || '',
            channelId: searchParams.get('channelId') || '',
            status: searchParams.get('status') || '',
            transactionId: searchParams.get('transactionId') || '',
            skip: Number(searchParams.get('skip')) || 0,
            limit: 10
        })
    }, [searchParams])

    useEffect(() => {
        setIsMounted(true);
    }, []);


    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    return (
        <>
            {/* Search Queries */}
            <form className="mx-auto w-full mb-5" onSubmit={handleSubmit}>
                <div className=' grid sm:grid-cols-2 md:grid-cols-3 gap-4'>

                    {/* Date Picker */}
                    <div>
                        <label>Date</label>
                        <Flatpickr
                            options={{
                                mode: 'range',
                                dateFormat: 'Y-m-d',
                                position: isRtl ? 'auto right' : 'auto left',
                            }}
                            defaultValue={`${searchParams.get('from')} to ${searchParams.get('to')}`}
                            className="form-input"

                            onChange={(selectedDates) => {
                                if (selectedDates.length === 2) {
                                    const [startDate, endDate] = selectedDates;
                                    const formatDate = (date) => {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    };
                                    const formattedStartDate = formatDate(startDate);
                                    const formattedEndDate = formatDate(endDate);
                                    setFormData({ ...formData, "from": formattedStartDate, "to": formattedEndDate });
                                }
                            }}
                        /></div>
                    {/* User Id */}
                    <div className="relative">
                        <label>User Id</label>
                        <input
                            type="text"
                            value={formData.userId}
                            placeholder="User Id ...."
                            name="userId"
                            className="form-input shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] bg-white rounded-full h-11 placeholder:tracking-wider ltr:pr-11 rtl:pl-11"
                            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        />
                    </div>
                    {/* Transaction Id */}
                    <div className="relative">
                        <label>Transaction Id</label>
                        <input
                            type="text"
                            value={formData.transactionId}
                            placeholder="Transaction Id ...."
                            name="transactionId"
                            className="form-input shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] bg-white rounded-full h-11 placeholder:tracking-wider ltr:pr-11 rtl:pl-11"
                            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        />
                    </div>
                    {/* Payment For */}
                    <div className="relative">
                        <label>Payment For</label>
                        <Select
                            defaultValue={formData.paymentFor}
                            options={paymentForOptions}
                            isSearchable={false}
                            onChange={(e) => setFormData({ ...formData, ["paymentFor"]: e?.value })}
                            name="paymentFor"
                            className='z-[10]' />

                    </div>
                    <div className="relative">
                        <label>Channel Id</label>
                        <input
                            type="text"
                            value={formData.channelId}
                            placeholder="Channel Id ...."
                            name="channelId"
                            className="form-input shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] bg-white rounded-full h-11 placeholder:tracking-wider ltr:pr-11 rtl:pl-11"
                            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        />
                    </div>

                </div>


                <div className='flex justify-center mt-2'>
                    <button className='bg-primary text-white p-2 font-bold rounded-md ' type='submit'>Submit</button>
                </div>

            </form>



            {/* Records Table */}
            {/* <div className="panel mt-6"> */}
                {/* <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Call Records</h5> */}

                {/* <div className="datatables">
                    {isMounted && (
                        <DataTable
                            noRecordsText="No results match your search query"
                            highlightOnHover
                            className="table-hover whitespace-nowrap"
                            records={initialRecords}
                            columns={[
                                {
                                    accessor: '_id',
                                    title: 'Transaction Id',
                                    sortable: true,
                                    render: ({ _id }) => <strong className="text-info">{_id}</strong>,
                                },
                                {
                                    accessor: 'amount',
                                    title: 'Amount',
                                    sortable: true,
                                    render: ({ amount }) => (
                                        <div className="flex items-center gap-2">
                                            <div className={`font-bold ${amount < 0 ? 'text-red-500' : 'text-green-500'}`}>{amount}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'balance',
                                    title: 'Balance',
                                    sortable: true,
                                    render: ({ balance }) => (
                                        <div className="flex items-center gap-2">
                                            <div className={`font-bold ${balance < 0 ? 'text-red-500' : 'text-green-500'}`}>{balance.toFixed(2)}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'notes',
                                    title: 'Caller Name',
                                    render: ({ notes }) => <div className="flex items-center gap-2">
                                        <strong className="text-primary">{notes?.callerName}</strong>
                                    </div>
                                },
                                {
                                    accessor: 'userId',
                                    title: 'User Id',
                                    sortable: true,
                                    render: ({ userId }) => (
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold">{userId}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'paymentFor',
                                    title: 'Payment For',
                                    render: ({ paymentFor }) => <div className="flex items-center gap-2">
                                        <strong className="font-bold">{paymentFor}</strong>
                                    </div>,
                                },
                                {
                                    accessor: 'notes',
                                    title: 'Notes',
                                    render: ({ notes }) => <div className="flex items-center gap-2">
                                        <strong className="text-secondary">{JSON.stringify(notes)}</strong>
                                    </div>,
                                },
                                {
                                    accessor: 'status',
                                    title: 'Status',
                                    render: ({ status }) => <div className="flex items-center justify-center">
                                        <span className={`badge bg-${roleStatusColor(status)} rounded-full`}>{status}</span>
                                    </div>
                                },
                                {
                                    accessor: 'createdAt',
                                    title: 'Transaction Time',
                                    render: ({ createdAt }) => <div className="flex items-center justify-center">
                                        <span className={`font-bold p-2`}>{createdAt}</span>
                                    </div>
                                }
                            ]}
                            idAccessor='_id'
                            fetching={isLoading}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            emptyState={transactionsData?.success === false ? <div>{transactionsData.message}</div> : <div>No records Found</div>}
                        />
                    )}
                </div> */}

                {/* For pagination */}
                {/* <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse m-auto mt-4"> */}
                    {/* Prev button */}
                    {/* <li>
                        <button
                            type="button"
                            className={`flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary ${formData.skip === 0 && 'cursor-not-allowed hover:bg-primary-light'}`}
                            onClick={() => {
                                let updatedFormData = { ...formData, skip: Number(formData.skip) - 10 }
                                setFormData(updatedFormData);
                                handleQuery(updatedFormData);
                            }}
                            disabled={formData.skip === 0}
                        >
                            <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                        </button>
                    </li> */}

                    {/* Next Button */}
                    {/* <li>
                        <button
                            type="button"
                            className={`flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary ${initialRecords.length < 10 && 'cursor-not-allowed hover:bg-primary-light'}`}
                            onClick={() => {
                                let updatedFormData = { ...formData, skip: Number(formData.skip) + 10 }
                                setFormData(updatedFormData);
                                handleQuery(updatedFormData);
                            }}
                            disabled={initialRecords.length < 10}
                        >
                            <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                        </button>
                    </li> */}
                {/* </ul> */}
            {/* </div> */}


            {/* Coomponent Transactions Table */}
            <ComponentTransactionsTable isMounted={isMounted} initialRecords={initialRecords} formData={formData} isLoading={isLoading} setFormData={setFormData} handleQuery={handleQuery} transactionsData={transactionsData}/>


        </>

    );
}

export default ComponentReadTransactions;