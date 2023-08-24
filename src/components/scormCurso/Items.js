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

    const [cmiData, setCmiData] = useState({})

    const baseURL = `/api/cursos`

    // const buildCourseUrl = (url) => `${base}/cursos_files/${courseId}/${url}`;
    const buildCourseUrl = (url) => `/cursos_files/${courseId}/${url}`;

    const getResourceByItem = (resourceId) =>
        courseData.resources.resource.filter((r) => r.identifier === resourceId)[0];

    //Inicializar Scorm
    let settings = {
        autocommit: true,
        autocommitSeconds: 5,
        logLevel: 4,
        alwaysSendTotalTime: true
    }
    let x;

    // eslint-disable-next-line no-undef
    x = window.API = new Scorm12API(settings);
    
    x.on("LMSInitialize", function () {
        console.log("LMSInitialize")
    });

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
