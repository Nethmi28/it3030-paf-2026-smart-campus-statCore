import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './LoginPage.css'; // Assuming you have a separate CSS file for styling

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Add your logic for handling account requests and credential validation here
        // For demonstration, assuming a successful login
        history.push('/dashboard');
    };

    return (
        <div className='login-page'>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label htmlFor='username'>Username:</label>
                    <input 
                        type='text' 
                        id='username' 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password:</label>
                    <input 
                        type='password' 
                        id='password' 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
