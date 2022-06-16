import React from "react";
import { reducer, initialState, IState } from "./reducer"

export const AppContext = React.createContext<{
	state: IState;
	dispatch: React.Dispatch<any>;
}>({
	state: initialState,
	dispatch: () => null
})

export function AppProvider({ children }: any) {

	const [state, dispatch] = React.useReducer(reducer, initialState)

	return (
		<AppContext.Provider value={{ state, dispatch }}>
			{children}
		</AppContext.Provider>
	)
}
