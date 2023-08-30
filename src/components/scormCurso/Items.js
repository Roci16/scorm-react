import React, { useEffect, useState } from 'react';
import './style.css'; // Importa los estilos CSS externos
import axios from 'axios';
import "scorm-again/dist/scorm12.js";


const Items = ({ courseId, }) => {
    const [scormInitialized, setScormInitialized] = useState(false);
    const [courseData, setCourseData] = useState({});
    const [resource, setResource] = useState('#');
    const [lessonStatus, setLessonStatus] = useState('');
    const [lessonLocation, setLessonLocation] = useState('');
    const [sessionTime, setSessionTime] = useState('00:00:00');
    const [totalTime, setTotalTime] = useState('');
    const [objectives, setObjectives] = useState({});
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    // const [popupOpen, setPopupOpen] = useState(false);
    const [cmiData, setCmiData] = useState({})

    const baseURL = `/api/cursos`

    // const buildCourseUrl = (url) => `${base}/cursos_files/${courseId}/${url}`;
    const buildCourseUrl = (url) => `/cursos_files/${courseId}/${url}`;

    const getResourceByItem = (resourceId) =>
        courseData.resources.resource.filter((r) => r.identifier === resourceId)[0];


    // useEffect(() => {
    //     //Inicializar Scorm
    //     let settings = {
    //         autocommit: true,
    //         autocommitSeconds: 5,
    //         logLevel: 4,
    //         alwaysSendTotalTime: true
    //     }
    //     // let x;

    //     // eslint-disable-next-line no-undef
    //     window.API = new Scorm12API(settings);

    //     window.API.on("LMSInitialize", function () {
    //         console.log("LMSInitialize")
    //     });


    //     // // const usersCMI = cmiData;
    //     // const usersCMI = localStorage.getItem("cmi");
    //     // if (usersCMI) {
    //     //     window.API.loadFromJSON(JSON.parse(usersCMI).cmi);
    //     // }

    //     window.API.on('LMSSetValue.cmi.*', async function (CMIElement, value) {
    //         window.API.storeData(true);
    //         // localStorage.setItem('cmi', JSON.stringify(window.API.renderCommitCMI(true)));

    //         const dataToSend = {
    //             cmi: window.API.renderCommitCMI(true)
    //         };

    //         const response = await fetch(`/api/cursos/actualizarProgreso/${idCurso}`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(dataToSend)
    //         });

    //         if (response.ok) {
    //             console.log('Datos enviados exitosamente.');
    //         } else {
    //             console.error('Error al enviar los datos.');
    //         }
    //     });

    // }, [idCurso])


    //Render Items
    function renderItems(items) {
        return items.map((item, index) => (
            <React.Fragment key={item.identifier}>
                <button
                    type="button"
                    className="btn btn-primary m-2"
                    // disabled
                    onClick={() => setResource(buildCourseUrl(getResourceByItem(item.identifierref).href))}
                >
                    {item.title}
                </button>
                {item.items?.length > 0 && renderItems(item.items)}
            </React.Fragment>
        ));
    }



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseURL}/informacion/${courseId}`);
                const data = await response.text();
                const parsedData = JSON.parse(data);

                setCourseData(parsedData);
                setScormInitialized(true);
                setIsLoading(false)
                // scorm()
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (courseData.organizations && courseData.organizations.organization) {
            const organizations = courseData.organizations;
            const organization = organizations.organization;
            const firstOrganization = organization[0];
            const courseTitle = firstOrganization.title;
            const firstOrganizationItems = firstOrganization.items;
            const firstItemFromFirstOrg = firstOrganizationItems[0];
            const resourceIdOfFirstItem = firstItemFromFirstOrg.identifierref;
            setTitle(courseTitle);
            setItems(firstOrganizationItems);

            const resources = courseData.resources;
            const resource = resources.resource;
            const openingResource = resource.find((r) => r.identifier === resourceIdOfFirstItem);
            const firstResourceUrl = openingResource.href;
            // console.log(firstResourceUrl);
            setResource(buildCourseUrl(firstResourceUrl));
        }
    }, [courseData]);


    useEffect(() => {
        // Obtener el progreso inicial del servidor
        const fetchProgress = async () => {
            try {
                const response = await fetch(`${baseURL}/progreso/${courseId}`);
                const data = await response.text();
                const parsedProgress = JSON.parse(data);

                // Actualizar los estados con el progreso inicial
                setLessonStatus(parsedProgress?.cmi_core?.cmiData?.cmi?.core?.lesson_status);
                setLessonLocation(parsedProgress?.cmi_core?.cmiData?.cmi?.core?.lesson_location);
                setSessionTime(parsedProgress?.cmi_core?.cmiData?.cmi?.core?.session_time);
                setTotalTime(parsedProgress?.cmi_core?.cmiData?.cmi?.core?.total_time);
                setObjectives(parsedProgress?.cmi_core?.cmiData?.cmi?.core?.objectives);

                console.log(lessonStatus)
                console.log(lessonLocation)
                console.log(sessionTime)
                console.log(totalTime)
                console.log(objectives)

                if (window.API && parsedProgress?.cmi_core?.cmiData?.cmi) {
                    window.API.loadFromJSON(parsedProgress.cmi_core.cmiData.cmi);
                    // console.log(parsedProgress.cmi_core.cmiData)
                }
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
    }, [courseId]);

    useEffect(() => {
        //Inicializar Scorm
        let settings = {
            autocommit: true,
            autocommitSeconds: 5,
            logLevel: 4,
            alwaysSendTotalTime: true
        }
        // let x;

        // eslint-disable-next-line no-undef
        window.API = new Scorm12API(settings);

        window.API.on("LMSInitialize", function () {
            // console.log("LMSInitialize")
        });

        window.API.on('LMSSetValue.cmi.*', async function (CMIElement, value) {
            window.API.storeData(true);

            const dataToSend = {
                cmiData: window.API.renderCommitCMI(true)
            };

            const response = await fetch(`/api/cursos/actualizarProgreso/${courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                console.log('Datos enviados exitosamente.');
                // console.log("Post: ", dataToSend)
                // progresoCmi();
            } else {
                console.error('Error al enviar los datos.');
            }
        });

    }, [])


    //////////////////////////////////
    ///Ventana emergente//////////////

    //     const openPopup = () => {
    //         setPopupOpen(true);
    //     };
    //     useEffect(() => {
    //         if (popupOpen) {
    //             const width = 800;
    //             const height = 600;
    //             const left = (window.innerWidth - width) / 2;
    //             const top = (window.innerHeight - height) / 2;

    //             window.open(resource, '_blank', `width=${width}, height=${height}, left=${left}, top=${top}`);

    //             setPopupOpen(false);
    //         }
    //     }, [popupOpen, resource]);


    // const progresoCmi = async () => {
    //     try {
    //         const response = await fetch(`${baseURL}/progreso/${courseId}`);
    //         const data = await response.text();
    //         const parsedDataProgreso = JSON.parse(data);

    //         setCmiData(parsedDataProgreso);

    //         // Acceder al valor de lesson_status
    //         const lessonStatusValue = parsedDataProgreso?.cmi_core?.cmiData?.cmi?.core?.lesson_status;
    //         console.log("Valor de lesson_status:", lessonStatusValue);
    //         setLessonStatus(lessonStatusValue)
    //         // console.log(parsedDataProgreso);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };



    return (
        <div className="container">
            {isLoading ? (
                <p>Cargando...</p> // Muestra el mensaje de "Cargando" mientras se carga lessonStatus
            ) : (
                <div>
                    <div className="d-flex flex-wrap">
                        <span className="badge bg-secondary m-1">Modelo de Servicio</span>
                        <span className="badge bg-secondary m-1">Plataforma Virtual</span>
                        <span className="badge bg-secondary m-1">Herramientas Digitales</span>
                        <span className="badge bg-secondary m-1">Desarrollo Profesional</span>
                    </div>

                    <div className="d-flex flex-wrap">{items.length && items[0]?.items?.length && renderItems(items)}</div>

                    <div className='iframe-container'>
                        <iframe
                            className="w-100 h-100"
                            allow="payment"
                            sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-modals allow-popups"
                            frameBorder="0"
                            id="course-iframe"
                            src={resource}
                        // src='http://autoservicio-scorm-dev.us-east-1.elasticbeanstalk.com/cursos_files/curso1/index_lms.html'
                        ></iframe>
                    </div>
                    <div>
                        {/* <button onClick={() => openPopup(resource)}>Ventana Emergente</button> */}
                        {/* 
                        <p>Lesson Status: {lessonStatus}</p>
                        <p>Tiempo en Sesión Activa: {sessionTime}</p>
                        <p>Tiempo Total: {totalTime}</p> */}

                    </div>
                </div>
            )}
        </div>
    );
};

export default Items;
