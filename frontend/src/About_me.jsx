import React from "react";
import "./about_me.css";
import { motion } from "framer-motion";

const AboutMe = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.2,
        duration: 0.5,
      }}
      viewport={{
        once: true,
      }}
      className="about_me"
      id="aboutMey"
    >
      <h2 className="heading">About Me</h2>
      <div className="about_me_info">
        <p className="about_me_left">
          Hi, I’m Saiteja — an aspiring full-stack developer with strong
          expertise in the MERN stack and a solid foundation in data structures
          and algorithms. I enjoy architecting clean, scalable, and
          high-performance applications while following modern development
          practices. I’m passionate about problem-solving, writing efficient
          code, and continuously learning new technologies to stay aligned with
          industry standards. My goal is to contribute to innovative projects
          and grow into a well-rounded, impactful software engineer.
        </p>
        <div className="about_me_right"></div>
      </div>
    </motion.div>
  );
};

export default AboutMe;
