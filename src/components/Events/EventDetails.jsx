import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal';

export default function EventDetails() {
    const [isDeleting, setIsDeleting] = useState(false);
    const params = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['events', params.id],
        queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    });

    const {
        mutate,
        isPending: isPendingDelete,
        isError: isErrorDelete,
        error: errorDelete,
    } = useMutation({
        mutationFn: deleteEvent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                refetchType: 'none',
            });
            navigate('/events');
        },
    });

    const handleStartDelete = () => {
        setIsDeleting(true);
    };

    const handleStopDelete = () => {
        setIsDeleting(false);
    };

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
                        <button onClick={handleStartDelete}>Delete</button>
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
            {isDeleting && (
                <Modal onClose={handleStopDelete}>
                    <h2>Are you sure?</h2>
                    <p>This action cannot be undone.</p>
                    <div className='form-actions'>
                        {isPendingDelete && <p>Deleting...</p>}
                        {!isPendingDelete && (
                            <>
                                <button
                                    onClick={handleStopDelete}
                                    className='button-text'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className='button'
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                    {isErrorDelete && (
                        <ErrorBlock
                            title='Failed to delete event'
                            message={errorDelete.message || 'Please try again.'}
                        />
                    )}
                </Modal>
            )}

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
