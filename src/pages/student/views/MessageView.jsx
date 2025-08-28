// src/pages/student/views/MessageView.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit, getDocs, writeBatch, doc } from 'firebase/firestore';
import './MessageView.css';

const MessageView = () => {
    const [facultyContacts, setFacultyContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messageAreaRef = useRef(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchContacts = async () => {
            try {
                const appointmentsRef = collection(db, 'appointments');
                const q = query(
                    appointmentsRef, 
                    where("studentId", "==", currentUser.uid),
                    where("status", "==", "upcoming")
                );
                const appointmentSnap = await getDocs(q);
                const teacherIds = [...new Set(appointmentSnap.docs.map(doc => doc.data().teacherId))];

                if (teacherIds.length > 0) {
                    const usersRef = collection(db, 'users');
                    const teachersQuery = query(usersRef, where('__name__', 'in', teacherIds));
                    const teachersSnap = await getDocs(teachersQuery);
                    const teachersList = teachersSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setFacultyContacts(teachersList);
                }
            } catch (error) {
                console.error("Error fetching teacher contacts:", error);
            }
        };
        fetchContacts();
    }, [currentUser]);

    // Effect to fetch last message AND unread count for each contact
    useEffect(() => {
        if (!currentUser || facultyContacts.length === 0) return;
        const unsubscribers = facultyContacts.map(contact => {
            const chatId = [currentUser.uid, contact.id].sort().join('_');
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            
            const lastMsgQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
            const unsubLastMsg = onSnapshot(lastMsgQuery, (snap) => {
                if (!snap.empty) {
                    const lastMsg = snap.docs[0].data();
                    setFacultyContacts(prev => prev.map(p => p.id === contact.id ? { ...p, lastMessage: lastMsg.text, timestamp: lastMsg.createdAt?.toDate() } : p));
                }
            });

            const unreadQuery = query(messagesRef, where('recipientId', '==', currentUser.uid), where('isRead', '==', false));
            const unsubUnread = onSnapshot(unreadQuery, (snap) => {
                setFacultyContacts(prev => prev.map(p => p.id === contact.id ? { ...p, unreadCount: snap.size } : p));
            });

            return () => {
                unsubLastMsg();
                unsubUnread();
            };
        });
        return () => unsubscribers.forEach(unsub => unsub());
    }, [currentUser, facultyContacts.length]);

    // Effect to fetch messages and mark them as read
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        const chatId = [currentUser.uid, activeChat.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const msgs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(msgs);

            const batch = writeBatch(db);
            const unreadMessages = querySnapshot.docs.filter(d => d.data().recipientId === currentUser.uid && !d.data().isRead);
            if (unreadMessages.length > 0) {
                unreadMessages.forEach(d => batch.update(d.ref, { isRead: true }));
                await batch.commit();
            }
        });
        return () => unsubscribe();
    }, [activeChat, currentUser]);

     useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeChat) return;
        const chatId = [currentUser.uid, activeChat.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            text: newMessage,
            senderId: currentUser.uid,
            recipientId: activeChat.id,
            isRead: false,
            createdAt: serverTimestamp(),
        });
        setNewMessage('');
    };
    
    const formatTimestamp = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className={`message-view-layout ${activeChat ? 'chat-active' : ''}`}>
            <aside className="faculty-list-sidebar">
                <div className="sidebar-header"><h2>Conversations</h2></div>
                <ul className="contacts-list">
                    {facultyContacts.map(contact => (
                        <li key={contact.id} className={`contact-item ${activeChat?.id === contact.id ? 'active' : ''}`} onClick={() => setActiveChat(contact)}>
                            <img src={`https://placehold.co/60x60/E8F0FE/3367D6?text=${contact.fullName?.charAt(0)}${contact.surname?.charAt(0)}`} alt={contact.fullName} className="contact-avatar" />
                            <div className="contact-info">
                                <span className="contact-name">{contact.fullName} {contact.surname}</span>
                                <span className="contact-last-message">{contact.lastMessage || 'No messages yet'}</span>
                            </div>
                            <div className="contact-meta">
                                {contact.unreadCount > 0 && <span className="unread-dot">{contact.unreadCount}</span>}
                                <span className="contact-timestamp">{formatTimestamp(contact.timestamp)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="chat-interface">
                {activeChat ? (
                    <div className="chat-window">
                        <div className="chat-header">
                            <button className="chat-back-button" onClick={() => setActiveChat(null)}><span className="material-symbols-outlined">arrow_back</span></button>
                            <img src={`https://placehold.co/60x60/E8F0FE/3367D6?text=${activeChat.fullName?.charAt(0)}${activeChat.surname?.charAt(0)}`} alt={activeChat.fullName} className="chat-avatar" />
                            <h3>{activeChat.fullName} {activeChat.surname}</h3>
                        </div>
                        <div className="message-area" ref={messageAreaRef}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}>{msg.text}</div>
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
                        <p>Choose a teacher from the list to view your message history.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessageView;
