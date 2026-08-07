import {
  FaCode,
  FaPaintBrush,
  FaLaptopCode,
  FaServer,
  FaUsers,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import EbenImage from "../assets/EBEN001.PNG";
import LanreImage from "../assets/LANRE001.PNG";
import TeamImage from "../assets/TEAM001.jpeg";


const About = () => {

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });


  useEffect(() => {

    const handleMouseMove = (e) => {

      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });

    };


    window.addEventListener(
      "mousemove",
      handleMouseMove
    );


    return () =>
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );


  }, []);



  return (

    <div className="
    relative
    bg-gray-50
    min-h-screen
    overflow-hidden
    ">



      {/* Animated Background */}

      <motion.div
        className="
        absolute
        w-96
        h-96
        bg-green-400/10
        rounded-full
        blur-3xl
        pointer-events-none
        "
        animate={{
          x: mousePosition.x / 20,
          y: mousePosition.y / 20,
        }}
        transition={{
          type:"spring",
          damping:30,
        }}
        style={{
          left:"10%",
          top:"20%",
        }}
      />



      <motion.div
        className="
        absolute
        w-96
        h-96
        bg-yellow-400/10
        rounded-full
        blur-3xl
        pointer-events-none
        "
        animate={{
          x:-mousePosition.x / 30,
          y:-mousePosition.y / 30,
        }}
        transition={{
          type:"spring",
          damping:30,
        }}
        style={{
          right:"10%",
          bottom:"20%",
        }}
      />



      <motion.div
        className="
        absolute
        w-72
        h-72
        bg-orange-400/10
        rounded-full
        blur-3xl
        pointer-events-none
        "
        animate={{
          x:mousePosition.x / 40,
          y:-mousePosition.y / 40,
        }}
        transition={{
          type:"spring",
          damping:30,
        }}
        style={{
          left:"50%",
          top:"50%",
        }}
      />





      {/* Hero */}

      <section className="
      relative
      bg-white/70
      py-28
      px-6
      ">


        <div className="
        max-w-6xl
        mx-auto
        text-center
        ">


          <motion.p

          initial={{
            opacity:0,
            y:20
          }}

          animate={{
            opacity:1,
            y:0
          }}

          className="
          text-[#0B8F4D]
          font-bold
          tracking-widest
          mb-5
          "
          >

            ABOUT OJA247

          </motion.p>




          <motion.h1

          initial={{
            opacity:0,
            y:40
          }}

          animate={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.7
          }}

          className="
          text-5xl
          md:text-6xl
          font-black
          text-gray-900
          leading-tight
          "
          >

            Building the future of

            <br/>

            Nigerian commerce


          </motion.h1>




          <motion.p

          initial={{
            opacity:0
          }}

          animate={{
            opacity:1
          }}

          transition={{
            delay:.5
          }}

          className="
          max-w-3xl
          mx-auto
          mt-7
          text-lg
          text-gray-600
          leading-8
          "
          >

            OJA247 is a Nigerian marketplace platform
            created to help small businesses build
            online storefronts, manage orders,
            accept payments, and grow digitally.


          </motion.p>



          <motion.div

          initial={{
            opacity:0,
            scale:.8
          }}

          animate={{
            opacity:1,
            scale:1
          }}

          transition={{
            delay:.7
          }}

          className="
          mt-8
          text-xl
          font-semibold
          "

          >

            Built for Sellers.

            <span className="
            text-[#0B8F4D]
            ">
              {" "}Made for Buyers.
            </span>


          </motion.div>


        </div>


      </section>





      {/* Mission */}


      <section className="
      max-w-6xl
      mx-auto
      px-6
      py-16
      ">


        <motion.div

        initial={{
          opacity:0,
          y:40
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        viewport={{
          once:true
        }}

        className="
        bg-white
        rounded-3xl
        border
        border-gray-200
        shadow-sm
        p-10
        md:p-14
        ">

          <h2 className="
          text-3xl
          font-bold
          text-[#0B8F4D]
          mb-6
          ">

            Our Mission

          </h2>


          <p className="
          text-gray-700
          text-lg
          leading-8
          ">

            OJA247 was created by two Software Engineering
            students at APTECH who saw the difficulties
            Nigerian entrepreneurs face when trying to
            establish an online presence.


          </p>



          <p className="
          mt-5
          text-gray-700
          text-lg
          leading-8
          ">

            Our goal is to make online selling simple,
            affordable, and accessible by giving businesses
            professional digital tools without complexity.


          </p>



        </motion.div>


      </section>

      {/* Founders */}

      <section className="
      max-w-6xl
      mx-auto
      px-6
      py-16
      ">


        <motion.div

        initial={{
          opacity:0,
          y:30
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        viewport={{
          once:true
        }}

        className="
        text-center
        mb-14
        "
        >

          <p className="
          text-[#0B8F4D]
          font-bold
          tracking-widest
          text-sm
          mb-3
          ">

            THE PEOPLE BEHIND IT

          </p>

          <h2 className="
          text-4xl
          font-black
          text-gray-900
          ">

            Meet The Founders

          </h2>

        </motion.div>




        {/* Combined founders card — hero-sized, single focal point */}

        <motion.div

        initial={{
          opacity:0,
          y:50,
          scale:.97
        }}

        whileInView={{
          opacity:1,
          y:0,
          scale:1
        }}

        viewport={{
          once:true
        }}

        transition={{
          duration:.6
        }}

        className="
        relative
        max-w-5xl
        mx-auto
        bg-gray-900
        rounded-[2.5rem]
        p-10
        md:p-16
        overflow-hidden
        shadow-2xl
        "
        >

          {/* subtle glow accents inside the card */}

          <div className="
          absolute
          -top-24
          -left-24
          w-72
          h-72
          bg-[#0B8F4D]/20
          rounded-full
          blur-3xl
          pointer-events-none
          "/>

          <div className="
          absolute
          -bottom-24
          -right-24
          w-72
          h-72
          bg-[#F59E0B]/20
          rounded-full
          blur-3xl
          pointer-events-none
          "/>


          <div className="
          relative
          flex
          flex-col
          items-center
          text-center
          ">


            {/* Overlapping avatars, much larger */}

            <div className="
            flex
            -space-x-10
            shrink-0
            mb-8
            ">

              <img
              src={EbenImage}
              alt="Ndudim Ebenezer Nmesoma"
              className="
              w-36
              h-36
              md:w-44
              md:h-44
              rounded-full
              object-cover
              border-4
              border-gray-900
              ring-4
              ring-[#0B8F4D]
              shadow-xl
              "
              />

              <img
              src={LanreImage}
              alt="Olanrewaju Williams Owolabi"
              className="
              w-36
              h-36
              md:w-44
              md:h-44
              rounded-full
              object-cover
              border-4
              border-gray-900
              ring-4
              ring-[#F59E0B]
              shadow-xl
              "
              />

            </div>




            <h3 className="
            text-3xl
            md:text-5xl
            font-black
            text-white
            leading-tight
            ">

              Ebenezer & Williams

            </h3>

            <p className="
            text-[#F59E0B]
            font-bold
            tracking-wide
            uppercase
            text-sm
            mt-3
            ">

              Co-Founders • OJA247

            </p>



            {/* individual name / role breakdown */}

            <div className="
            grid
            sm:grid-cols-2
            gap-6
            w-full
            max-w-3xl
            mt-10
            ">

              <div className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-6
              ">

                <p className="
                text-white
                font-bold
                text-lg
                ">
                  Ndudim Ebenezer Nmesoma
                </p>

                <p className="
                text-[#0B8F4D]
                font-semibold
                text-sm
                mt-1
                ">
                  Frontend & Design Lead
                </p>

              </div>


              <div className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-6
              ">

                <p className="
                text-white
                font-bold
                text-lg
                ">
                  Olanrewaju Williams Owolabi
                </p>

                <p className="
                text-[#F59E0B]
                font-semibold
                text-sm
                mt-1
                ">
                  Backend Lead
                </p>

              </div>

            </div>




            <p className="
            text-gray-300
            text-lg
            leading-8
            mt-10
            max-w-3xl
            ">

              Two Software Engineering students at APTECH,
              pairing frontend craft with backend engineering
              to build a single, cohesive product from the
              ground up.

            </p>




            <div className="
            flex
            flex-wrap
            gap-3
            mt-8
            justify-center
            ">

              {[
                "Frontend Development",
                "UI/UX Design",
                "Backend Engineering",
                "API Development",
                "Database Architecture",
                "System Security",
                "Product Strategy",
              ].map((skill,index)=>(

                <span
                key={skill}
                className={`
                px-4
                py-2
                rounded-full
                text-sm
                font-semibold
                ${
                  index % 2 === 0
                  ?
                  "bg-[#0B8F4D]/15 text-[#0B8F4D]"
                  :
                  "bg-[#F59E0B]/15 text-[#F59E0B]"
                }
                `}
                >

                  {skill}

                </span>

              ))}

            </div>


          </div>


        </motion.div>




        {/* Team photo - small, centered */}

        <motion.div

        initial={{
          opacity:0,
          y:20
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        viewport={{
          once:true
        }}

        className="
        flex
        flex-col
        items-center
        mt-14
        "
        >

          <img

          src={TeamImage}

          alt="The OJA247 Team"

          className="
          w-24
          h-24
          rounded-full
          object-cover
          border-4
          border-white
          shadow-md
          "
          />

          <p className="
          mt-4
          font-semibold
          text-gray-900
          ">

            The OJA247 Team

          </p>

          <p className="
          text-sm
          text-gray-500
          ">

            Software Engineering Students @ APTECH

          </p>

        </motion.div>


      </section>







      {/* Closing Section */}


      <section className="
      bg-[#0B8F4D]
      text-white
      py-20
      px-6
      text-center
      ">


        <motion.div

        initial={{
          opacity:0,
          y:30
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        viewport={{
          once:true
        }}

        >

          <FaUsers
          className="
          mx-auto
          text-5xl
          mb-5
          "
          />



          <h2 className="
          text-4xl
          font-black
          ">

            Two Developers.
            <br/>
            One Vision.

          </h2>




          <p className="
          max-w-3xl
          mx-auto
          mt-6
          text-lg
          opacity-90
          leading-8
          ">

            By combining frontend development,
            backend engineering, design, and product
            strategy, OJA247 is being built to help
            Nigerian businesses sell smarter.

          </p>


        </motion.div>


      </section>


    </div>

  );

};



export default About;