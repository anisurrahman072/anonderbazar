module.exports = {
  isResourceOwner: function (authUser, resource) {

    if (authUser.group_id.name === 'customer') {
      // eslint-disable-next-line eqeqeq
      return (resource && resource.user_id && resource.user_id == authUser.id);
    }
    return true;

  },
  isResourceOwnerWarehouse: function(authUser, resource){
    if (authUser.group_id.name === 'owner') {
      // eslint-disable-next-line eqeqeq
      return (resource && resource.warehouse_id && resource.warehouse_id == authUser.warehouse_id.id);
    }
    return true;
  }
};
