const {
  OPERATION_MAP
} = require('@evershop/evershop/src/lib/util/filterOperationMapp');
const { getValueSync } = require('@evershop/evershop/src/lib/util/registry');

module.exports = async function registerDefaultCouponCollectionFilters() {
  // List of default supported filters
  const defaultFilters = [
    {
      key: 'coupon',
      operation: ['eq', 'like'],
      callback: (query, operation, value, currentFilters) => {
        if (operation === 'eq') {
          query.andWhere('coupon.coupon', '=', value);
        } else {
          query.andWhere('coupon.coupon', 'ILIKE', `%${value}%`);
        }
        currentFilters.push({
          key: 'name',
          operation,
          value
        });
      }
    },
    {
      key: 'status',
      operation: ['eq'],
      callback: (query, operation, value, currentFilters) => {
        query.andWhere('coupon.status', OPERATION_MAP[operation], value);
        currentFilters.push({
          key: 'status',
          operation,
          value
        });
      }
    },
    {
      key: 'ob',
      operation: ['eq'],
      callback: (query, operation, value, currentFilters) => {
        const couponCollectionSortBy = getValueSync('couponCollectionSortBy', {
          coupon: (query) => query.orderBy('coupon.coupon'),
          status: (query) => query.orderBy('coupon.status'),
          used_time: (query) => query.orderBy('coupon.used_time')
        });

        if (couponCollectionSortBy[value]) {
          couponCollectionSortBy[value](query, operation);
          currentFilters.push({
            key: 'ob',
            operation,
            value
          });
        }
      }
    }
  ];

  return defaultFilters;
};
