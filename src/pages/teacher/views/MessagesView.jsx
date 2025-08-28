// src/pages/teacher/views/MessagesView.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import './MessagesView.css';

const MessagesView = () => {
    const [studentContacts, setStudentContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
    const messageAreaRef = useRef(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) return;
        const fetchStudentContacts = async () => {
            try {
                const appointmentsRef = collection(db, 'appointments');
                const q = query(appointmentsRef, where("teacherId", "==", currentUser.uid), where("status", "==", "upcoming"));
                const appointmentSnap = await getDocs(q);
                const studentIds = [...new Set(appointmentSnap.docs.map(doc => doc.data().studentId))];

                if (studentIds.length > 0) {
                    const usersRef = collection(db, 'users');
                    const studentsQuery = query(usersRef, where('__name__', 'in', studentIds));
                    const studentsSnap = await getDocs(studentsQuery);
                    const studentsList = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setStudentContacts(studentsList);
                } else {
                    setStudentContacts([]);
                }
            } catch (error) {
                console.error("Error fetching student contacts:", error);
            }
        };
        fetchStudentContacts();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || studentContacts.length === 0) return;
        const unsubscribers = studentContacts.map(contact => {
            const chatId = [currentUser.uid, contact.id].sort().join('_');
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
            return onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const lastMsg = querySnapshot.docs[0].data();
                    setStudentContacts(prev => prev.map(p => p.id === contact.id ? { ...p, lastMessage: lastMsg.text, timestamp: lastMsg.createdAt?.toDate() } : p));
                }
            });
        });
        return () => unsubscribers.forEach(unsub => unsub());
    }, [currentUser, studentContacts.length]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!activeChat || !currentUser) return;
        const chatId = [currentUser.uid, activeChat.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setMessages(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, [activeChat, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeChat) return;
        const chatId = [currentUser.uid, activeChat.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, { text: newMessage, senderId: currentUser.uid, createdAt: serverTimestamp() });
        setNewMessage('');
    };

    const handleDeleteMessage = async (messageId) => {
        if (!activeChat) return;
        const chatId = [currentUser.uid, activeChat.id].sort().join('_');
        await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
    };

    const handleStartEdit = (message) => {
        setEditingMessageId(message.id);
        setEditingText(message.text);
        setOpenMenuMessageId(null);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingText('');
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingMessageId || !activeChat) return;
        const chatId = [currentUser.uid, activeChat.id].sort().join('_');
        await updateDoc(doc(db, 'chats', chatId, 'messages', editingMessageId), { text: editingText });
        handleCancelEdit();
    };
    
    const formatTimestamp = (date) => date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

    return (
        <div className={`message-view-layout ${activeChat ? 'chat-active' : ''}`}>
            <aside className="contact-list-sidebar">
                <div className="sidebar-header"><h2>Conversations</h2></div>
                <ul className="contacts-list">
                    {studentContacts.map(contact => (
                        <li key={contact.id} className={`contact-item ${activeChat?.id === contact.id ? 'active' : ''}`} onClick={() => setActiveChat(contact)}>
                            <img src={`https://placehold.co/60x60/FEF4E8/D66D00?text=${contact.fullName?.charAt(0)}${contact.surname?.charAt(0)}`} alt={contact.fullName} className="contact-avatar" />
                            <div className="contact-info">
                                <span className="contact-name">{contact.fullName} {contact.surname}</span>
                                <span className="contact-last-message">{contact.lastMessage || 'No messages yet'}</span>
                            </div>
                            <span className="contact-timestamp">{formatTimestamp(contact.timestamp)}</span>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="chat-interface">
                {activeChat ? (
                    <div className="chat-window">
                        <div className="chat-header">
                            <button className="chat-back-button" onClick={() => setActiveChat(null)}><span className="material-symbols-outlined">arrow_back</span></button>
                            <img src={`https://placehold.co/60x60/FEF4E8/D66D00?text=${activeChat.fullName?.charAt(0)}${activeChat.surname?.charAt(0)}`} alt={activeChat.fullName} className="chat-avatar" />
                            <h3>{activeChat.fullName} {activeChat.surname}</h3>
                        </div>
                        <div className="message-area" ref={messageAreaRef}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`message-wrapper ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}>
                                    <div className="message">
                                        {editingMessageId === msg.id ? (
                                            <form onSubmit={handleSaveEdit} className="edit-message-form">
                                                <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} autoFocus onBlur={handleCancelEdit} />
                                            </form>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                    {msg.senderId === currentUser.uid && !editingMessageId && (
                                        <div className="message-actions">
                                            <button className="message-options-btn" onClick={() => setOpenMenuMessageId(openMenuMessageId === msg.id ? null : msg.id)}>
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                            {openMenuMessageId === msg.id && (
                                                <div className="options-menu">
                                                    <button className="menu-item" onClick={() => handleStartEdit(msg)}>
                                                        <span className="material-symbols-outlined">edit</span> Edit
                                                    </button>
                                                    <button className="menu-item delete" onClick={() => handleDeleteMessage(msg.id)}>
                                                        <span className="material-symbols-outlined">delete</span> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button type="submit" className="send-button"><span className="material-symbols-outlined">send</span></button>
                        </form>
                    </div>
                ) : (
                    <div className="no-chat-selected">
                        <span className="material-symbols-outlined">chat</span>
                        <h2>Select a conversation</h2>
                        <p>Choose a student from the list to view your message history.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesView;
