function buildQueryOptions(query, searchableFields = []) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sort === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const filter = {};
  if (query.q && searchableFields.length) {
    const regex = new RegExp(query.q, 'i');
    filter.$or = searchableFields.map((f) => ({ [f]: regex }));
  }
  Object.keys(query).forEach((key) => {
    if (key.endsWith('[min]')) {
      const field = key.replace('[min]', '');
      filter[field] = { ...(filter[field] || {}), $gte: Number(query[key]) };
    } else if (key.endsWith('[max]')) {
      const field = key.replace('[max]', '');
      filter[field] = { ...(filter[field] || {}), $lte: Number(query[key]) };
    }
  });

  return { page, limit, sort, filter };
}

module.exports = { buildQueryOptions };



