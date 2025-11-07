const Notice = require("../models/notice.model");
const ApiResponse = require("../utils/ApiResponse");
const Student = require("../models/details/student-details.model");
const Faculty = require("../models/details/faculty-details.model");
const sendNoticeMail = require("../utils/sendNoticeMail");

const getNoticeController = async (req, res) => {
  try {
    const notices = await Notice.find();
    if (!notices || notices.length === 0) {
      return ApiResponse.error("No Notices Found", 404).send(res);
    }
    return ApiResponse.success(notices, "All Notices Loaded!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const addNoticeController = async (req, res) => {
  const { title, description, type, link } = req.body;

  if (!title || !description || !type) {
    return ApiResponse.error("All fields are required", 400).send(res);
  }

  try {
    // Create the notice
    const notice = await Notice.create({
      title,
      description,
      type,
      link,
    });

    // Determine recipients
    let recipients = [];
    if (type === "student") {
      recipients = await Student.find();
    } else if (type === "faculty") {
      recipients = await Faculty.find();
    } else if (type === "both") {
      const students = await Student.find();
      const faculties = await Faculty.find();
      recipients = [...students, ...faculties];
    }

    // Send emails (in parallel)
    if (recipients.length > 0) {
      const emailPromises = recipients.map((user) => {
        return sendNoticeMail(user.email, title, description, link);
      });
      await Promise.all(emailPromises);
    }

    return ApiResponse.created(notice, "Notice added and emails sent!").send(res);
  } catch (error) {
    console.error("Error adding notice:", error);
    return ApiResponse.error(error.message).send(res);
  }
};


const updateNoticeController = async (req, res) => {
  const { title, description, type, link } = req.body;
  const updateFields = {};

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (type) updateFields.type = type;
  if (link) updateFields.link = link;

  if (Object.keys(updateFields).length === 0) {
    return ApiResponse.error("No fields provided for update", 400).send(res);
  }

  try {
    let notice = await Notice.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });

    if (!notice) {
      return ApiResponse.error("Notice Not Found!", 404).send(res);
    }

    if (notice) {
      console.log("type--", type)

      // Determine recipients
      let recipients = [];
      if (type === "student") {
        recipients = await Student.find();
      } else if (type === "faculty") {
        recipients = await Faculty.find();
      } else if (type === "both") {
        const students = await Student.find();
        const faculties = await Faculty.find();
        recipients = [...students, ...faculties];
      }

      console.log("recipients.length---", recipients.length)

      // Send emails (in parallel)
      if (recipients.length > 0) {
        const emailPromises = recipients.map((user) => {
          console.log("Sending to:", user.email);
          return sendNoticeMail(user.email, title, description, link);
        });
        await Promise.all(emailPromises);
      }
    }

    return ApiResponse.success(notice, "Notice Updated Successfully!").send(
      res
    );
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

const deleteNoticeController = async (req, res) => {
  try {
    if (!req.params.id) {
      return ApiResponse.error("Notice ID is required", 400).send(res);
    }

    let notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return ApiResponse.error("Notice Not Found!", 404).send(res);
    }
    return ApiResponse.success(null, "Notice Deleted Successfully!").send(res);
  } catch (error) {
    return ApiResponse.error(error.message).send(res);
  }
};

module.exports = {
  getNoticeController,
  addNoticeController,
  updateNoticeController,
  deleteNoticeController,
};
