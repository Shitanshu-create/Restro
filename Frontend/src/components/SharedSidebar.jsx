import Sidepanel from "./Sidepanel.jsx";



const SharedSidebar = ({ activePage, onPageChange, isOpen, onClose, mode }) => {
  return (
    <Sidepanel
      activePage={activePage}
      onPageChange={onPageChange}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
    />
  );
};


export default SharedSidebar;
