module.exports = (sequelize, Sequelize) => {
    const ScholarSubSchema = sequelize.define('ScholarSub', {
        scholarship_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        subcategory_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    
    return ScholarSubSchema;
}
