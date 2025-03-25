import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../../supabaseClient'
import { User } from '@supabase/supabase-js'

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [userDetails, setUserDetails] = useState<{ first_name: string; last_name: string; email: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setScreen('landing')
      } else {
        setScreen('signin')
      }
    })
  }, [])

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      setUser(data.user)
      setScreen('landing')
    }
  }

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      const { error: insertError } = await supabase
        .from('user_details')
        .insert([{ uuid: data.user.id, first_name: firstName, last_name: lastName, email }])
      if (!insertError) {
        setScreen('signin')
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUserDetails(null)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setScreen('signin')
  }

  async function fetchUserDetails() {
    if (user) {
      const { data, error } = await supabase
        .from('user_details')
        .select('*')
        .eq('uuid', user.id)
        .single()
      if (!error) {
        setUserDetails(data)
      }
    }
  }

  useEffect(() => {
    if (screen === 'landing' && user) {
      fetchUserDetails()
    }
  }, [screen, user])

  if (screen === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (screen === 'signin') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sign In</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <View style={styles.buttonSpacing}>
          <TouchableOpacity style={styles.button} onPress={signIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonSpacing}>
          <TouchableOpacity style={styles.linkButton} onPress={() => setScreen('signup')}>
            <Text style={styles.linkButtonText}>Go to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (screen === 'signup') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sign Up</Text>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <View style={styles.buttonSpacing}>
          <TouchableOpacity style={styles.button} onPress={signUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonSpacing}>
          <TouchableOpacity style={styles.linkButton} onPress={() => setScreen('signin')}>
            <Text style={styles.linkButtonText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (screen === 'landing') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Landing Page</Text>
        {userDetails ? (
          <Text style={styles.welcome}>Welcome, {userDetails.first_name} {userDetails.last_name}</Text>
        ) : (
          <Text style={styles.loadingText}>Loading user details...</Text>
        )}
        <View style={styles.buttonSpacing}>
          <TouchableOpacity style={styles.button} onPress={signOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingTop: 200,
    textAlign: 'center',
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  buttonSpacing: {
    marginVertical: 5,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#007BFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  welcome: {
    fontSize: 18,
    marginBottom: 10
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  }
})
