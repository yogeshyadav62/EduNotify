import { Class } from '../models/index.js';

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

export const createClass = async (req, res) => {
  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ message: 'Class ID and Class Name are required' });
  }

  try {
    const formattedId = id.toUpperCase().trim();
    
    // Check if class already exists
    const existingClass = await Class.findByPk(formattedId);
    if (existingClass) {
      return res.status(400).json({ message: `Class ${formattedId} already exists` });
    }

    const newClass = await Class.create({
      id: formattedId,
      name: name.trim()
    });

    return res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({ message: 'Failed to create class' });
  }
};

export const updateClass = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Class Name is required' });
  }

  try {
    const classObj = await Class.findByPk(id.toUpperCase());
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    classObj.name = name.trim();
    await classObj.save();

    return res.json(classObj);
  } catch (error) {
    console.error('Error updating class:', error);
    return res.status(500).json({ message: 'Failed to update class' });
  }
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const classObj = await Class.findByPk(id.toUpperCase());
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await classObj.destroy();
    return res.json({ message: `Class ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting class:', error);
    return res.status(500).json({ message: 'Failed to delete class. Make sure it has no active students.' });
  }
};
