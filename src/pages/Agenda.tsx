import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Flame, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import EventModal from '../components/EventModal';
import { useFinanceStore, Event } from '../store/useFinanceStore'; // Import Event and useFinanceStore

const Agenda = () => {
  const { theme } = useTheme();
  const { events, addEvent, updateEvent, deleteEvent, isLoading } = useFinanceStore(); // Use store for events
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // Keep local date for calendar navigation
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getEventsForDate = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return events.filter(event => event.date === selectedDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleAddEvent = (date?: string) => {
    setEditingEvent(null);
    setSelectedDate(date || null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Event) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
    } else {
      await addEvent(eventData);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este evento?')) {
      await deleteEvent(eventId);
    }
  };

  const selectedDateEventsData = getSelectedDateEvents();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header com título em borda */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border-2 border-cyan-400/50 ${
          theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'
        }`}>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Agenda Financeira
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddEvent()}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Novo Evento
          </motion.button>
        </div>

        {/* Navegação do mês */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className={`p-2 transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className={`font-medium px-4 text-center min-w-[180px] ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className={`p-2 transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className={`xl:col-span-2 rounded-lg p-4 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
          }`}>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className={`text-center font-medium py-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20"></div>
              ))}
              
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = i + 1;
                const dayEvents = getEventsForDate(date);
                const isToday = new Date().getDate() === date && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                
                return (
                  <motion.div
                    key={date}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleDateClick(date)}
                    className={`h-16 sm:h-20 p-1 border rounded cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? theme === 'dark'
                          ? 'bg-emerald-900 border-emerald-500' 
                          : 'bg-emerald-100 border-emerald-400'
                        : isToday 
                          ? theme === 'dark'
                            ? 'bg-violet-900 border-violet-500' 
                            : 'bg-violet-100 border-violet-400'
                          : theme === 'dark'
                            ? 'border-slate-700 hover:bg-slate-700'
                            : 'border-gray-200 hover:bg-teal-50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {date}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, index) => (
                        <div
                          key={index}
                          className={`w-full h-1 rounded ${
                            event.type === 'payment' ? 'bg-emerald-400' : 
                            event.type === 'goal' ? 'bg-orange-400' : 'bg-blue-400'
                          }`}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Events Timeline */}
          <div className={`rounded-lg p-4 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Próximos Eventos
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-teal-50'
                }`}>
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    event.type === 'payment' 
                      ? theme === 'dark' ? 'bg-emerald-900' : 'bg-emerald-100'
                      : event.type === 'goal' 
                        ? theme === 'dark' ? 'bg-orange-900' : 'bg-orange-100'
                        : theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
                  }`}>
                    {event.type === 'payment' ? (
                      <DollarSign className={`${
                        event.type === 'payment' 
                          ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                          : event.type === 'goal' 
                            ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                            : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} size={16} />
                    ) : (
                      <Flame className={`${
                        event.type === 'payment' 
                          ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                          : event.type === 'goal' 
                            ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                            : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {event.title}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                    </p>
                    {event.amount && (
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        R$ {event.amount.toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditEvent(event)}
                      disabled={isLoading}
                      className={`p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={isLoading}
                      className={`p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Report */}
        {selectedDate && selectedDateEventsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Eventos de {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </h3>
              <button
                onClick={() => handleAddEvent(selectedDate)}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedDateEventsData.map((event) => (
                <div key={event.id} className={`rounded-lg p-4 ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-teal-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === 'payment' 
                            ? theme === 'dark' ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                            : event.type === 'goal' 
                              ? theme === 'dark' ? 'bg-orange-900 text-orange-400' : 'bg-orange-100 text-orange-700'
                              : theme === 'dark' ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.type === 'payment' ? 'Pagamento' :
                           event.type === 'goal' ? 'Meta' : 'Lembrete'}
                        </span>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {event.time}
                        </span>
                      </div>
                      <h4 className={`font-medium mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {event.title}
                      </h4>
                      <p className={`text-sm mb-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {event.description}
                      </p>
                      {event.amount && (
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          R$ {event.amount.toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditEvent(event)}
                        disabled={isLoading}
                        className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark' 
                            ? 'text-gray-400 hover:text-white hover:bg-slate-600' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-teal-100'
                        }`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={isLoading}
                        className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark' 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-slate-600' 
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filtros */}
        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Filtros
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Data Início
              </label>
              <input
                type="date"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Data Fim
              </label>
              <input
                type="date"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Categoria
              </label>
              <select className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
              }`}>
                <option>Todas</option>
                <option>Pagamentos</option>
                <option>Metas</option>
                <option>Lembretes</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={selectedDate || undefined}
      />
    </>
  );
};

export default Agenda;