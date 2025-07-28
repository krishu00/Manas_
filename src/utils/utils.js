export const isNotNull = data => {
  return data !== '' && data !== '' && data !== undefined;
};
    

 export const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};