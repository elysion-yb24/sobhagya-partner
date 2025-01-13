'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { toggleRTL, toggleTheme, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark, toggleSidebar } from '@/store/themeConfigSlice';
import Loading from '@/components/layouts/loading';
import { getTranslation } from '@/i18n';
import { addUser } from './store/userSlice';
import Cookies from 'universal-cookie';
import { getProfile, getUserProfile } from './utils';
import { useRouter } from 'next/navigation';
import { AppProgressBar } from 'next-nprogress-bar';
import Swal from 'sweetalert2';

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
    const dispatch = useDispatch();
    const { initLocale } = getTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const cookies = new Cookies(null, { path: '/' });

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
        dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu));
        dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout));
        dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation));
        dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar));
        dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark));
        // locale
        initLocale(themeConfig.locale);
    }, [dispatch, initLocale, themeConfig]);

    async function checkAuthentication() {
        try {
            setIsLoading(true);
            const apiData = await getUserProfile('/profile', cookies.get('access_token'));
            if (apiData?.success) {
                if (apiData?.data?.role === "user") {
                    Toast.fire({
                        title: "You are not authorized to login",
                        icon: "error"
                    });
                    cookies.remove('access_token');
                    cookies.remove('token');
                    router.replace('/auth/login');
                }
                dispatch(addUser(apiData.data));
            } else {
                dispatch(addUser(null));
                cookies.remove('access_token');
                cookies.remove('token');
                router.replace('/auth/login');
            }
        } catch (err) {
            dispatch(addUser(null));
            Toast.fire({
                title: "Something went wrong",
                icon: "error"
            });
            cookies.remove('access_token');
            cookies.remove('token');
            router.replace('/auth/login');
            console.log('Err in checkAuthentication', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [dispatch]);

    useEffect(() => {
        if (cookies.get('access_token')) {
            checkAuthentication();
        } else {
            setIsLoading(false);
            router.replace('/auth/login');
        }
    }, [cookies]);

    return (
        <div
            className={`w-screen h-screen flex flex-col overflow-hidden ${(themeConfig.sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${themeConfig.rtlClass} main-section relative font-nunito text-sm font-normal antialiased`}
        >
            {isLoading ? <Loading /> : children}
            <AppProgressBar
                height="4px"
                color="#4287f5"
                options={{ showSpinner: false }}
                shallowRouting={false}
            />
        </div>
    );
}

export default App;
