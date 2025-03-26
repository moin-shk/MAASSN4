import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setScreen('landing')
      } else {
        setScreen('signin')
      }
    }
    getSession()
  }, [])

  // Sign Up: Create an account but do NOT insert extra details yet.
  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      alert('Sign-up successful! Please sign in.')
      setScreen('signin')
    } else {
      alert('Error during sign-up: ' + error?.message)
    }
  }

  // Sign In: Authenticate and then check if the user details record exists.
  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      setUser(data.user)
      // Check if user details record exists
      const { data: userRecord } = await supabase
        .from("User")
        .select("*")
        .eq("uuid", data.user.id)
        .maybeSingle()
      if (!userRecord) {
        // If the record is missing, attempt to insert it using available details.
        // If firstName/lastName are missing, you could prompt the user or handle it as needed.
        if (!firstName || !lastName) {
          alert("Profile details missing. Please complete your profile.")
          // Optionally navigate to a 'Complete Profile' screen.
          return
        }
        const { error: insertError } = await supabase
          .from("User")
          .insert([{ uuid: data.user.id, first_name: firstName, last_name: lastName, email }])
        if (insertError) {
          alert("Error inserting user details: " + insertError.message)
          return
        }
      }
      setScreen('landing')
    } else {
      alert('Incorrect credentials. Please try again.')
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
        .from("User")
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
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={signIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => setScreen('signup')}>
          <Text style={styles.linkButtonText}>Go to Sign Up</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (screen === 'signup') {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Sign Up</Text>
        <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
        <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={signUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => setScreen('signin')}>
          <Text style={styles.linkButtonText}>Go to Sign In</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
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
