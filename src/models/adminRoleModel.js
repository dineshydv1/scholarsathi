module.exports = (sequelize, Sequelize)=>{
    const AdminRoleSchema = sequelize.define('AdminRole', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        }
    });
    return AdminRoleSchema;
}