import dayjs from 'dayjs';

const formatNumber = ({ value }, decPlaces = 2) => (
    !value ? '0.00' : value.toFixed(decPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
);

const formatDate = ({ value }) => dayjs(value).format('MMM D YYYY');

const sortDate = (a, b) => (dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1);

export {
    formatNumber,
    formatDate,
    sortDate,
};
