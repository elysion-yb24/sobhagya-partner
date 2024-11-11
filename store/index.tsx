import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/themeConfigSlice';
import userSlice from '@/store/userSlice'
import videoSlice from '@/store/videoSlice'

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    user:userSlice,
    video:videoSlice
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
