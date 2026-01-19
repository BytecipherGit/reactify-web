import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage for web
import authReducer from './reducers/authSlice'
import postReducer from './reducers/postSlice'
import profileReducer from './reducers/profileSlice'
import chatReducer from './reducers/chatSlice'
import notificationsReducer from './reducers/notificationsSlice'
import groupsReducer from './reducers/groupsSlice'
import storiesReducer from './reducers/storiesSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
}

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  profile: profileReducer,
  chat: chatReducer,
  notifications: notificationsReducer,
  groups: groupsReducer,
  stories: storiesReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
