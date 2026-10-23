import AsyncStorage from '@react-native-async-storage/async-storage';

const getLikedBlogsStorageKey = session => {
  const accountIdentifier =
    session?.employeeId || session?.email || session?.name || 'default';
  const value = `${session?.accountType || 'unknown'}:${accountIdentifier
    .trim()
    .toLowerCase()}`;
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return `blogLikedIds:${hash.toString(36)}`;
};

export const getCachedLikedBlogIds = async session => {
  try {
    const storedIds = await AsyncStorage.getItem(
      getLikedBlogsStorageKey(session),
    );

    return new Set(storedIds ? JSON.parse(storedIds).map(String) : []);
  } catch (error) {
    console.error('Blog liked-state cache load failed:', error);

    return new Set();
  }
};

export const updateLikedBlogCache = async (session, blogId, isLiked) => {
  try {
    const storageKey = getLikedBlogsStorageKey(session);
    const storedIds = await AsyncStorage.getItem(storageKey);
    const likedIds = new Set(
      storedIds ? JSON.parse(storedIds).map(String) : [],
    );

    if (isLiked) {
      likedIds.add(String(blogId));
    } else {
      likedIds.delete(String(blogId));
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify([...likedIds]));
  } catch (error) {
    console.error('Blog liked-state cache update failed:', error);
  }
};
