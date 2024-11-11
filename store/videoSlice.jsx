import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data:null
}

const userSlice = createSlice({
    name: 'video',
    initialState: initialState,
    reducers: {
        addVideo: (state, action) => {
            state.data=action.payload
        },
        removeVideo:(state,action)=>{
            state.data=null
        }
    },
});

export default userSlice.reducer;
export const { addVideo, removeVideo } = userSlice.actions