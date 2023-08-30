import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Items from './Items'
import './style.css'; // Importa los estilos CSS externos
import { ProgressBar } from 'react-bootstrap';


const InicioScorm = () => {

    const [lesson_status, setLesson_status] = useState("");
    const [activeCollapse, setActiveCollapse] = useState('');
    const [courses, setCourses] = useState([]);
    const progressVariant = lesson_status === "incomplete" ? "danger" : "success";
    const [lessonStatusMap, setLessonStatusMap] = useState({}); // Mapa de lesson_status por courseId


    // const url = "http://autoservicio-scorm-dev.us-east-1.elasticbeanstalk.com/api/cursos"
    const url = "/api/cursos"

    useEffect(() => {
        fetch(url)
            .then((response) => response.json())
            // .then((data) => setCourses(data))
            .then((data) => {
                if (Array.isArray(data)) {
                    setCourses(data);
                } else {
                    console.error('Received data is not an array:', data);
                }
            })
            .catch((error) => console.error('Error fetching courses:', error));
    }, []);


    const handleCollapse = (courseId) => {
        // console.log(courseId)
        setActiveCollapse(courseId === activeCollapse ? '' : courseId);
    };

    const calculateProgress = (lesson_status) => {
        if (lesson_status === "incomplete") {
            return 40;
        } else {
            return 100;
        }
    };

    const now = calculateProgress();

    const progresoCmi = async (courseId) => {
        try {
            const response = await fetch(`${url}/progreso/${courseId}`);
            const data = await response.text();
            const parsedDataProgreso = JSON.parse(data);
            const lessonStatusValue =
                parsedDataProgreso?.cmi_core?.cmiData?.cmi?.core?.lesson_status;
            // console.log(lessonStatusValue)
            return lessonStatusValue;

        } catch (error) {
            // console.error('Error:', error);
        }
    };

    useEffect(() => {
        // Obtener el progreso de todos los cursos
        const fetchLessonStatuses = async () => {
            const lessonStatuses = {};
            for (const course of courses) {
                const lessonStatus = await progresoCmi(course.id);
                lessonStatuses[course.id] = lessonStatus || "incomplete";
            }
            // console.log(lessonStatuses)
            setLessonStatusMap(lessonStatuses);
        };
        fetchLessonStatuses();
    }, [courses]);

    return (
        <div>
            <nav className="breadcrumbs" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/inicio">
                            <i style={{ pointerEvents: "none" }} className="fa fa-home color-orange" aria-hidden="true"></i> Inicio
                        </Link>
                    </li>
                    <li className="breadcrumb-item active prueba" aria-current="page">
                        Cursos Scorm
                    </li>
                </ol>
            </nav>
            <section className="noticias mb-3">
                <div className="header-page-container">
                    <h1>Cursos</h1>
                </div>
            </section>
            <section>
                {courses &&
                    courses.map((course) => (
                        <div key={course.id} className="card mb-1"
                        >
                            {/* <Link to={`/course/${course.id}`} className="text-decoration-none d-block"> */}
                            <div
                                className='content-collapse'
                                onClick={() => handleCollapse(course.id)}
                                aria-expanded={course.id === activeCollapse}
                            >
                                <h2 className="text-wrap m-0">
                                    {course.name}
                                </h2>
                                <div className="collapse-progressbar">
                                    {/* <ProgressBar now={now} label={lesson_status === "incomplete" ? "0%" : `${now}%`} className="progressbar" variant={progressVariant} /> */}
                                    <ProgressBar
                                        now={calculateProgress(lessonStatusMap[course.id])}
                                        label={
                                            lessonStatusMap[course.id] === "incomplete"
                                                ? "0%"
                                                // : "100%" 
                                                : `${now}%`
                                        }
                                        className="progressbar"
                                        variant=
                                        {
                                            lessonStatusMap[course.id] === "incomplete"
                                                ? "danger"
                                                : progressVariant
                                        }
                                    />
                                    <i
                                        className="fa fa-chevron-down fs-4"
                                        aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="course-description">
                                <p>{course.description}</p>
                            </div>

                            {/* </Link> */}
                            <div className={`collapse ${course.id === activeCollapse ? 'show' : ''}`}
                                id={`collapse-${course.id}`}>
                                <div className="card-body">
                                    {course.id === activeCollapse && <Items courseId={course.id}
                                        setLesson_status={setLesson_status}
                                    />}

                                </div>
                            </div>



                        </div>
                    ))}
            </section>
        </div>
    );
}


export default InicioScorm