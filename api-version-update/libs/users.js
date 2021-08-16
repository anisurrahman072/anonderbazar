const {pagination} = require('./pagination');
const Promise = require('bluebird');

exports.getAllUsers = async (req, groupId) => {
  const userNativeQuery = Promise.promisify(User.getDatastore().sendNativeQuery);
  let _pagination = pagination(req.query);
  let query = req.query;
  let rawSelect = `
      SELECT customer.id as id, CONCAT(customer.first_name, ' ',customer.last_name) as customer_name,
      customer.username as username, customer.email as email, customer.last_login as last_login,
      customer.active as customer_active, customer.email as email, customer.active as customer_active,
      customer.phone as phone, customer.avatar as customer_avatar, customer.gender as customer_gender,
      customer.group_id as group_id,  customer.upazila_id as upazila_id,
      customer.zila_id as zila_id, customer.division_id as division_id, customer.national_id as national_id,
      division.name as division_name, zilla.name as zilla_name, upazila.name as upazila_name, userGroup.name as group_name
      `;

  let fromSQL = ' FROM users as customer  ';
  fromSQL += ' LEFT JOIN areas as division ON division.id = customer.division_id   ';
  fromSQL += ' LEFT JOIN areas as zilla ON zilla.id = customer.zila_id   ';
  fromSQL += ' LEFT JOIN areas as upazila ON upazila.id = customer.upazila_id   ';
  fromSQL += ' LEFT JOIN groups as userGroup ON userGroup.id = customer.group_id   ';

  let _where;

  if (groupId === 'adminUser') {
    _where = ` WHERE customer.deleted_at IS NULL AND (customer.group_id = 1 OR customer.user_type  = 'admin') `;
  } else {
    _where = ` WHERE customer.deleted_at IS NULL AND customer.group_id = '${groupId}' `;
  }
  if (query.searchTermUsername) {
    _where += ` AND customer.username LIKE '%${query.searchTermUsername}%' `;
  }

  if (query.searchTermPhone && query.searchTermEmail) {
    _where += ` AND (customer.phone LIKE '%${query.searchTermPhone}%' OR customer.email LIKE '%${query.searchTermEmail}%') `;

  } else if (query.searchTermEmail) {
    _where += ` AND customer.email LIKE '%${query.searchTermEmail}%' `;
  } else if (query.searchTermPhone) {
    _where += ` AND customer.phone LIKE '%${query.searchTermPhone}%' `;
  }

  if (query.searchTermName) {
    _where += ` AND (customer.first_name LIKE '%${query.searchTermName}%' OR customer.last_name LIKE '%${query.searchTermName}%') `;
  }
  if (query.gender) {
    _where += ` AND customer.gender = '${query.gender}' `;
  }

  let _sort = ``;
  if (query.sortKey && query.sortValue) {
    let key = ` customer.${query.sortKey} `;
    if (query.sortKey === 'name') {
      key = ' CONCAT(customer.first_name, \' \',customer.first_name) ';
    }
    _sort += ` ORDER BY ${key} ${query.sortValue} `;
  } else {
    _sort += ` ORDER BY customer.created_at DESC `;
  }

  let totalCustomers = 0;
  let allCustomer = [];
  const totalCustomerRaw = await userNativeQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
  if (totalCustomerRaw && totalCustomerRaw.rows && totalCustomerRaw.rows.length > 0) {
    totalCustomers = totalCustomerRaw.rows[0].totalCount;
    _pagination.limit = _pagination.limit ? _pagination.limit : totalCustomers;

    let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
    const rawResult = await userNativeQuery(rawSelect + fromSQL + _where + _sort + limitSQL, []);

    allCustomer = rawResult.rows;
  }

  return {
    allCustomer,
    totalCustomers,
    _pagination
  };
};
