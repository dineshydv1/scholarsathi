module.exports = (sequelize, Sequelize) => {
    const ParentChildrenSchema = sequelize.define('ParentChildren', {
        parent_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        children_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return ParentChildrenSchema;
}
