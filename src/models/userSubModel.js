module.exports = (sequelize, Sequelize) => {
    const UserSubSchema = sequelize.define('UserSub', {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        subcategory_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    },{
        timestamps: false
    });

    return UserSubSchema;
}
