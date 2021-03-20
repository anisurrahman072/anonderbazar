exports.pagination = (reqBody) => {
  let limit;
  let skip;
  let page;
  if (reqBody.limit === 'all') {
    limit = null;
    skip = 0;
    page = 1;
  } else {
    limit = parseInt(reqBody.limit) || 10;
    skip = parseInt(reqBody.page ? limit * (reqBody.page - 1) : 0) | 0; // if there is no skip set skip to 0
    page = parseInt(reqBody.page) || 1; // if there is no page number set page to 1
  }
  return {
    limit,
    skip,
    page,
  };
};
