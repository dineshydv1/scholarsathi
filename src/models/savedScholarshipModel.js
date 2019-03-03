module.exports = (sequelize, Sequelize) => {
    const SavedScholarshipSchema = sequelize.define('SavedScholarship', {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        scholarship_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    return SavedScholarshipSchema;
}
