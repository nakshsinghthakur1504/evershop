const {
  OPERATION_MAP
} = require('@evershop/evershop/src/lib/util/filterOperationMapp');
const { getValueSync } = require('@evershop/evershop/src/lib/util/registry');

module.exports = async function registerDefaultCategoryCollectionFilters() {
  const { isAdmin } = this;
  // List of default supported filters
  const defaultFilters = [
    {
      key: 'name',
      operation: ['like'],
      callback: (query, operation, value, currentFilters) => {
        query.andWhere(
          'category_description.name',
          OPERATION_MAP[operation],
          `%${value}%`
        );
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
        query.andWhere('category.status', OPERATION_MAP[operation], value);
        currentFilters.push({
          key: 'status',
          operation,
          value
        });
      }
    },
    {
      key: 'include_in_nav',
      operation: ['eq'],
      callback: (query, operation, value, currentFilters) => {
        query.andWhere(
          'category.include_in_nav',
          OPERATION_MAP[operation],
          value
        );
        currentFilters.push({
          key: 'include_in_nav',
          operation,
          value
        });
      }
    },
    {
      key: 'ob',
      operation: ['eq'],
      callback: (query, operation, value, currentFilters) => {
        const categorySortBy = getValueSync(
          'categoryCollectionSortBy',
          {
            name: (query) => query.orderBy('category_description.name'),
            include_in_nav: (query) => query.orderBy('category.include_in_nav'),
            status: (query) => query.orderBy('category.status')
          },
          {
            isAdmin
          }
        );

        if (categorySortBy[value]) {
          categorySortBy[value](query, operation);
          currentFilters.push({
            key: 'ob',
            operation,
            value
          });
        } else {
          query.orderBy('category.category_id', 'DESC');
        }
      }
    }
  ];

  return defaultFilters;
};
