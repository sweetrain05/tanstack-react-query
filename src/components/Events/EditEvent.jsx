import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import { queryClient, updateEvent } from '../../util/http.js';

export default function EditEvent() {
    const navigate = useNavigate();
    const params = useParams();

    // pre-populate the input fields with data
    const { data, isPending, isError, error } = useQuery({
        queryKey: ['events', params.id],
        queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    });

    // Optimistic Updating
    const { mutate } = useMutation({
        mutationFn: updateEvent,
        onMutate: async (data) => {
            const newEvent = data.event;

            await queryClient.cancelQueries({
                queryKey: ['events', params.id],
            });
            const previousEvent = queryClient.getQueryData([
                'events',
                params.id,
            ]);

            queryClient.setQueryData(['events', params.id], newEvent);

            return { previousEvent };
        },
        onError: (error, data, context) => {
            queryClient.setQueryData(
                ['events', params.id],
                context.previousEvent
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries(['events', params.id]);
        },
    });

    function handleSubmit(formData) {
        mutate({ id: params.id, event: formData });
        navigate('../');
    }

    function handleClose() {
        navigate('../');
    }

    let content;
    if (isPending) {
        content = (
            <div className='center'>
                <LoadingIndicator />
            </div>
        );
    }

    if (isError) {
        content = (
            <>
                <ErrorBlock
                    title='Failed to load event details.'
                    message={error.message || 'Please try again.'}
                />
                <div className='form-actions'>
                    <Link to='../' className='button'>
                        Okay
                    </Link>
                </div>
            </>
        );
    }

    if (data) {
        content = (
            <EventForm inputData={data} onSubmit={handleSubmit}>
                <Link to='../' className='button-text'>
                    Cancel
                </Link>
                <button type='submit' className='button'>
                    Update
                </button>
            </EventForm>
        );
    }

    return <Modal onClose={handleClose}>{content}</Modal>;
}
