'use client';
import { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';

const Overlay = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    return (
        <>
            {/* sidebar menu overlay */}
            <div className={`${(!themeConfig.sidebar && 'hidden') || ''}  bg-[blfixed inset-0 z-50ack]/60 hidden`} onClick={() => dispatch(toggleSidebar())}></div>
        </>
    );
};

export default Overlay;
