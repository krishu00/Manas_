import { MMKV } from 'react-native-mmkv';


export const storage = new MMKV();

export const isContaineKey = (key) => {
  return storage.contains(key);
};

export const storeData = (key, data) => {
  return storage.set(key, data);
};

export const getStoreData = (key, def = null) => {
  return storage.contains(key) ? storage.getString(key) : def;
};


export const deleteData = (key) => {
  storage.delete(key);
};

export const getStoreDataAsJson = (key, def = null) => {
  let storeDataStr = storage.contains(key) ? storage.getString(key) : def;
  if (storeDataStr != null) {
    storeDataStr = JSON.parse(storeDataStr);
  }
  return storeDataStr;
};
