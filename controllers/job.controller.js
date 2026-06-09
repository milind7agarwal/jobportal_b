import {Job} from "../models/job.model.js";
//Admin
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, location, salary, jobType, companyId, position, experience } = req.body;
        const userId = req.id; 
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({message: "All fields are required",success: false,});
        }

        const job = await Job.create({
            title,
            description,
            requirements:requirements.split(","),            
            location,
            salary: Number(salary),
            jobType,
            experienceLevel: experience,
            company: companyId,
            position,
            created_by: userId,
        });
        res.status(201).json({ message: "Job posted successfully", success: true, job });
    }catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
};
//user
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query).populate({ path: "company",}).sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", status: false });
    }
    return res.status(200).json({ jobs, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};
//user
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({ message: "Job id is required", status: false });
    }

    // Validate ObjectId format before querying (prevents CastError)
    if (!jobId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({ message: "Invalid job id", status: false });
    }

    const job = await Job.findById(jobId);
    // .populate({path: "applications"});

    if (!job) {
      return res.status(404).json({ message: "Job not found", status: false });
    }

    return res.status(200).json({ job, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};
//admin
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      sort: { createdAt: -1 },
    });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", status: false });
    }
    return res.status(200).json({ jobs, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};