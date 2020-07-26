import dayjs from 'dayjs';

const formatNumber = (number, decPlaces = 2) =>
    number.toFixed(decPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const formatDate = (date) => dayjs(date).format('MMM D YYYY');

const sortDate = (a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1;

export {
    formatNumber,
    formatDate,
    sortDate
};
