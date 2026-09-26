import React from 'react';
import ClassSchedule from '../components/ClassSchedule';
import Events from '../components/Events';
import { useOutletContext } from 'react-router-dom';

const Classes = () => {
  const { openModal } = useOutletContext<{ openModal: (title?: string, scheduleId?: string) => void }>();

  return (
    <div className="pt-24 pb-12">
      <ClassSchedule onBook={(scheduleId) => openModal("Book Class Slot", scheduleId)} />
      <Events />
    </div>
  );
};

export default Classes;
