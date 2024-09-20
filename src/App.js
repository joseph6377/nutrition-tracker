import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from './components/ui/alert';
import { Input } from './components/ui/input';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Plus, Minus, Search, PlusCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data to simulate database (unchanged)
const mockFoodItems = [
  { id: '1', name: 'Apple', calories: 95, protein: 0.5, fats: 0.3, carbs: 25 },
  { id: '2', name: 'Chicken Breast', calories: 165, protein: 31, fats: 3.6, carbs: 0 },
  { id: '3', name: 'Brown Rice', calories: 216, protein: 4.5, fats: 1.8, carbs: 45 },
  { id: '4', name: 'Salmon', calories: 206, protein: 22, fats: 13, carbs: 0 },
  { id: '5', name: 'Broccoli', calories: 55, protein: 3.7, fats: 0.6, carbs: 11 },
];

async function fetchNutritionInfo(foodName, apiKey) {
  if (!apiKey) {
    throw new Error('API key is not set. Please enter your GROQ API key.');
  }

  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: "You are a nutritional information assistant. Provide nutritional information for foods in JSON format."
          },
          {
            role: "user",
            content: `Provide nutritional information for ${foodName} in JSON format with keys: name (including serving size), calories, protein, fats, carbs. Use grams for protein, fats, and carbs. If unsure, provide estimates and round to nearest whole number. The name should include a common serving size.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Unexpected API response structure');
    }

    const content = data.choices[0].message.content;
    console.log('Content:', content);

    // Parse the content as JSON
    try {
      if (typeof content === 'object' && content !== null) {
        return content;
      }
      const nutritionInfo = JSON.parse(content);
      return nutritionInfo;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('Error extracting JSON:', extractError);
        }
      }
      throw new Error('Failed to parse nutrition information');
    }
  } catch (error) {
    console.error('Error in fetchNutritionInfo:', error);
    throw error;
  }
}

const AddFoodItemForm = ({ onAddItem, onAddAndLogItem, selectedDate, apiKey }) => {
  const [newItem, setNewItem] = useState({ name: '', calories: '', protein: '', fats: '', carbs: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e, shouldLog = false) => {
    e.preventDefault();
    if (!newItem.name) {
      setError('Please enter a name for the food item');
      return;
    }
    const itemToAdd = {
      ...newItem,
      calories: Number(newItem.calories) || 0,
      protein: Number(newItem.protein) || 0,
      fats: Number(newItem.fats) || 0,
      carbs: Number(newItem.carbs) || 0,
    };
    if (shouldLog) {
      onAddAndLogItem(itemToAdd);
    } else {
      onAddItem(itemToAdd);
    }
    setNewItem({ name: '', calories: '', protein: '', fats: '', carbs: '' });
    setError('');
  };

  const handleAutoFill = async () => {
    setIsLoading(true);
    try {
      const nutritionData = await fetchNutritionInfo(newItem.name, apiKey);
      setNewItem({
        name: nutritionData.name,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        fats: nutritionData.fats,
        carbs: nutritionData.carbs,
      });
      setError('');
    } catch (error) {
      console.error("Failed to auto-fill nutrition information:", error);
      setError("Failed to retrieve nutrition information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      <Input
        placeholder="Name (e.g., 1 medium apple)"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        className="mb-2"
      />
      <button 
        type="button"
        onClick={handleAutoFill} 
        disabled={isLoading || !newItem.name} 
        className="mb-2 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? "Auto-filling..." : "Auto-fill Nutrition"}
      </button>
      <Input
        type="number"
        placeholder="Calories"
        value={newItem.calories}
        onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
        className="mb-2"
      />
      <Input
        type="number"
        placeholder="Protein (g)"
        value={newItem.protein}
        onChange={(e) => setNewItem({ ...newItem, protein: e.target.value })}
        className="mb-2"
      />
      <Input
        type="number"
        placeholder="Fats (g)"
        value={newItem.fats}
        onChange={(e) => setNewItem({ ...newItem, fats: e.target.value })}
        className="mb-2"
      />
      <Input
        type="number"
        placeholder="Carbs (g)"
        value={newItem.carbs}
        onChange={(e) => setNewItem({ ...newItem, carbs: e.target.value })}
        className="mb-2"
      />
      <div className="flex space-x-2">
        <button type="submit" className="flex-1 flex items-center justify-center p-2 bg-green-500 text-white rounded hover:bg-green-600">
          <PlusCircle className="mr-2" size={18} />
          Add Item
        </button>
        <button 
          type="button" 
          onClick={(e) => handleSubmit(e, true)} 
          className="flex-1 flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusCircle className="mr-2" size={18} />
          Add and Log
        </button>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

const NutritionTracker = () => {
  const [foodItems, setFoodItems] = useState(mockFoodItems);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nutritionHistory, setNutritionHistory] = useState({});
  const [apiKey, setApiKey] = useState('');
  const [weightHistory, setWeightHistory] = useState({});
  const [stepHistory, setStepHistory] = useState({});

  useEffect(() => {
    // Load selected items for the current date from local storage
    const storedItems = localStorage.getItem(selectedDate);
    if (storedItems) {
      setSelectedItems(JSON.parse(storedItems));
    } else {
      setSelectedItems({});
    }

    // Load nutrition history from local storage
    const storedHistory = localStorage.getItem('nutritionHistory');
    if (storedHistory) {
      setNutritionHistory(JSON.parse(storedHistory));
    }

    // Load weight history from local storage
    const storedWeightHistory = localStorage.getItem('weightHistory');
    if (storedWeightHistory) {
      setWeightHistory(JSON.parse(storedWeightHistory));
    }

    // Load step history from local storage
    const storedStepHistory = localStorage.getItem('stepHistory');
    if (storedStepHistory) {
      setStepHistory(JSON.parse(storedStepHistory));
    }
  }, [selectedDate]);

  useEffect(() => {
    // Save selected items to local storage whenever they change
    localStorage.setItem(selectedDate, JSON.stringify(selectedItems));

    // Update nutrition history
    const dailyNutrition = calculateTotalNutrition();
    setNutritionHistory(prevHistory => ({
      ...prevHistory,
      [selectedDate]: dailyNutrition
    }));
  }, [selectedItems, selectedDate]);

  useEffect(() => {
    // Save nutrition history to local storage
    localStorage.setItem('nutritionHistory', JSON.stringify(nutritionHistory));

    // Save weight history to local storage
    localStorage.setItem('weightHistory', JSON.stringify(weightHistory));

    // Save step history to local storage
    localStorage.setItem('stepHistory', JSON.stringify(stepHistory));
  }, [nutritionHistory, weightHistory, stepHistory]);

  const addFoodItem = (newItem) => {
    const newId = String(foodItems.length + 1);
    setFoodItems([...foodItems, { ...newItem, id: newId }]);
  };

  const addAndLogFoodItem = (newItem) => {
    const newId = String(foodItems.length + 1);
    const itemWithId = { ...newItem, id: newId };
    setFoodItems([...foodItems, itemWithId]);
    selectFoodItem(itemWithId);
  };

  const selectFoodItem = (item) => {
    setSelectedItems(prevItems => {
      const updatedItems = { ...prevItems };
      if (updatedItems[item.id]) {
        updatedItems[item.id] = { ...item, count: updatedItems[item.id].count + 1 };
      } else {
        updatedItems[item.id] = { ...item, count: 1 };
      }
      return updatedItems;
    });
  };

  const removeSelectedItem = (id) => {
    setSelectedItems(prevItems => {
      const updatedItems = { ...prevItems };
      if (updatedItems[id].count > 1) {
        updatedItems[id] = { ...updatedItems[id], count: updatedItems[id].count - 1 };
      } else {
        delete updatedItems[id];
      }
      return updatedItems;
    });
  };

  const calculateTotalNutrition = () => {
    const total = Object.values(selectedItems).reduce((total, item) => ({
      calories: total.calories + item.calories * item.count,
      protein: total.protein + item.protein * item.count,
      fats: total.fats + item.fats * item.count,
      carbs: total.carbs + item.carbs * item.count,
    }), { calories: 0, protein: 0, fats: 0, carbs: 0 });

    return {
      calories: Math.round(total.calories),
      protein: Math.round(total.protein),
      fats: Math.round(total.fats),
      carbs: Math.round(total.carbs),
    };
  };

  const getDashboardData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      ...(nutritionHistory[date] || { calories: 0, protein: 0, fats: 0, carbs: 0 })
    }));
  };

  const getWeightData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      weight: weightHistory[date] || null
    }));
  };

  const getStepData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      steps: stepHistory[date] || 0
    }));
  };

  const getCombinedData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map(date => ({
      date,
      calories: nutritionHistory[date]?.calories || 0,
      weight: weightHistory[date] || null,
      steps: stepHistory[date] || 0
    }));

    // Normalize data
    const maxCalories = Math.max(...data.map(d => d.calories));
    const maxWeight = Math.max(...data.filter(d => d.weight !== null).map(d => d.weight));
    const maxSteps = Math.max(...data.map(d => d.steps));

    return data.map(d => ({
      ...d,
      normalizedCalories: (d.calories / maxCalories) * 100,
      normalizedWeight: d.weight !== null ? (d.weight / maxWeight) * 100 : null,
      normalizedSteps: (d.steps / maxSteps) * 100
    }));
  };

  const logWeight = (date, weight) => {
    setWeightHistory(prev => ({ ...prev, [date]: weight }));
  };

  const logSteps = (date, steps) => {
    setStepHistory(prev => ({ ...prev, [date]: steps }));
  };

  const WeightStepLogger = ({ selectedDate, onLogWeight, onLogSteps }) => {
    const [weight, setWeight] = useState('');
    const [steps, setSteps] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (weight) onLogWeight(selectedDate, Number(weight));
      if (steps) onLogSteps(selectedDate, Number(steps));
      setWeight('');
      setSteps('');
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          step="0.1"
        />
        <Input
          type="number"
          placeholder="Steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Log Data
        </button>
      </form>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-gray-800">Nutrition Tracker</h1>

      <div className="flex flex-col md:flex-row items-center justify-center mb-6 md:mb-8">
        <Calendar className="mr-2 text-teal-600 mb-2 md:mb-0" size={24} />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-auto border-2 border-teal-300 rounded-md focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
        />
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="flex flex-wrap justify-center mb-6 md:mb-8 space-x-2 md:space-x-4">
          <TabsTrigger value="home" className="mb-2 md:mb-0">Home</TabsTrigger>
          <TabsTrigger value="daily-log" className="mb-2 md:mb-0">Daily Log</TabsTrigger>
          <TabsTrigger value="add" className="mb-2 md:mb-0">Add New Food Item</TabsTrigger>
          <TabsTrigger value="weight-steps" className="mb-2 md:mb-0">Weight & Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-teal-500 text-white p-3 md:p-4">Calories per Day (Last 7 Days)</CardHeader>
              <CardContent className="h-60 md:h-80 p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDashboardData()}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 12}} />
                    <Bar dataKey="calories" fill="#14b8a6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-indigo-500 text-white p-3 md:p-4">Macro Nutrients per Day (Last 7 Days)</CardHeader>
              <CardContent className="h-60 md:h-80 p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDashboardData()}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 12}} />
                    <Bar dataKey="protein" fill="#818cf8" />
                    <Bar dataKey="fats" fill="#fbbf24" />
                    <Bar dataKey="carbs" fill="#34d399" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-purple-500 text-white p-3 md:p-4">Weight Trend (Last 7 Days)</CardHeader>
              <CardContent className="h-60 md:h-80 p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getWeightData()}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 12}} />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-orange-500 text-white p-3 md:p-4">Daily Steps (Last 7 Days)</CardHeader>
              <CardContent className="h-60 md:h-80 p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getStepData()}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: 12}} />
                    <Bar dataKey="steps" fill="#ffa500" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-blue-500 text-white p-3 md:p-4">Calories, Weight, and Steps Correlation (Last 7 Days)</CardHeader>
              <CardContent className="h-60 md:h-80 p-2 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getCombinedData()}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" tick={{fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === "Normalized Calories") return [props.payload.calories, "Calories"];
                        if (name === "Normalized Weight") return [props.payload.weight, "Weight (kg)"];
                        if (name === "Normalized Steps") return [props.payload.steps, "Steps"];
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{fontSize: 12}} />
                    <Line yAxisId="left" type="monotone" dataKey="normalizedCalories" stroke="#14b8a6" name="Normalized Calories" />
                    <Line yAxisId="left" type="monotone" dataKey="normalizedWeight" stroke="#8884d8" name="Normalized Weight" />
                    <Line yAxisId="left" type="monotone" dataKey="normalizedSteps" stroke="#ffa500" name="Normalized Steps" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily-log">
          <div className="space-y-6">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="bg-emerald-500 text-white p-3 md:p-4">Total Nutrition for {selectedDate}</CardHeader>
              <CardContent className="p-3 md:p-4 flex flex-wrap justify-between">
                <h3 className="text-lg md:text-xl font-semibold mb-2 w-full sm:w-auto">Calories: <span className="font-normal">{calculateTotalNutrition().calories}</span></h3>
                <h3 className="text-lg md:text-xl font-semibold mb-2 w-full sm:w-auto">Protein: <span className="font-normal">{calculateTotalNutrition().protein}g</span></h3>
                <h3 className="text-lg md:text-xl font-semibold mb-2 w-full sm:w-auto">Fats: <span className="font-normal">{calculateTotalNutrition().fats}g</span></h3>
                <h3 className="text-lg md:text-xl font-semibold w-full sm:w-auto">Carbs: <span className="font-normal">{calculateTotalNutrition().carbs}g</span></h3>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-[calc(100vh-400px)]">
                <CardHeader className="bg-amber-500 text-white p-3 md:p-4">Search Food Items</CardHeader>
                <CardContent className="p-3 md:p-4 flex-grow flex flex-col">
                  <div className="relative mb-4">
                    <Input
                      placeholder="Search by name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-rose-300 rounded-md focus:border-rose-500 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    {foodItems.filter(item =>
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                      <div key={item.id} className="flex justify-between items-center mb-2 p-2 hover:bg-gray-100 rounded">
                        <span className="text-sm md:text-base">{item.name} - {item.calories} cal</span>
                        <button onClick={() => selectFoodItem(item)} className="text-teal-500 hover:text-teal-600">
                          <Plus size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-[calc(100vh-400px)]">
                <CardHeader className="bg-rose-500 text-white p-3 md:p-4">Selected Items for {selectedDate}</CardHeader>
                <CardContent className="p-3 md:p-4 flex-grow overflow-y-auto">
                  {Object.values(selectedItems).map((item) => (
                    <div key={item.id} className="flex justify-between items-center mb-2 p-2 hover:bg-gray-100 rounded">
                      <span className="text-sm md:text-base">{item.name} (x{item.count})</span>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => selectFoodItem(item)} className="text-teal-500 hover:text-teal-600">
                          <Plus size={18} />
                        </button>
                        <button onClick={() => removeSelectedItem(item.id)} className="text-rose-500 hover:text-rose-600">
                          <Minus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card className="max-w-sm md:max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-cyan-500 text-white p-3 md:p-4">Add New Food Item</CardHeader>
            <CardContent className="p-3 md:p-4">
              <Input
                type="text"
                placeholder="Enter GROQ API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mb-4"
                minLength="32"
                maxLength="64"
              />
              <AddFoodItemForm 
                onAddItem={addFoodItem} 
                onAddAndLogItem={addAndLogFoodItem}
                selectedDate={selectedDate}
                apiKey={apiKey} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight-steps">
          <Card className="max-w-sm md:max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-purple-500 text-white p-3 md:p-4">Log Weight & Steps</CardHeader>
            <CardContent className="p-3 md:p-4">
              <WeightStepLogger
                selectedDate={selectedDate}
                onLogWeight={logWeight}
                onLogSteps={logSteps}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionTracker;