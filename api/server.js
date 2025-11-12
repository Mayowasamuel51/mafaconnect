const { User } = require('./models/user');
(async () => {
  const user = await User.findOne({ where: { account_number: '00000032' } });
  console.log(user ? user.toJSON() : 'not found');
})();
