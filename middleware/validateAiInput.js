export const validateAiInput = (req, res, next) => {
  const { selfDescription, jobDescription } = req.body;

  if (!jobDescription || !String(jobDescription).trim()) {
    return res.status(400).json({ message: "Job description is required.", status: false });
  }

  if (!req.file && (!selfDescription || !String(selfDescription).trim())) {
    return res.status(400).json({
      message: "Please provide either a resume file or a self description.",
      status: false,
    });
  }

  next();
};

