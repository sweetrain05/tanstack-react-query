import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
    const params = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['events', params.id],
        queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    });

    const { mutate } = useMutation({
        mutationFn: deleteEvent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                refetchType: 'none',
            });
            navigate('/events');
        },
    });

    const handleDelete = () => {
        mutate({ id: params.id });
    };

    let content;

    if (isLoading) {
        content = (
            <div id='event-details-content' className='center'>
                <LoadingIndicator />
            </div>
        );
    }

    if (isError) {
        content = (
            <ErrorBlock
                title='Failed to load event details'
                message={error.message || 'Please try again'}
            />
        );
    }

    if (data) {
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        content = (
            <>
                <header>
                    <h1>{data.title}</h1>
                    <nav>
                        <button onClick={handleDelete}>Delete</button>
                        <Link to='edit'>Edit</Link>
                    </nav>
                </header>
                <div id='event-details-content'>
                    <img
                        src={`http://localhost:3000/${data.image}`}
                        alt={data.title}
                    />
                    <div id='event-details-info'>
                        <div>
                            <p id='event-details-location'>{data.location}</p>
                            <time dateTime={`Todo-DateT$Todo-Time`}>
                                {formattedDate} @ {data.time}
                            </time>
                        </div>
                        <p id='event-details-description'>{data.description}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Outlet />
            <Header>
                <Link to='/events' className='nav-item'>
                    View all Events
                </Link>
            </Header>
            <article id='event-details'>{content}</article>
        </>
    );
}
