import * as React from "react"
import { Button } from "./button"
import { 
  X, 
  Minus, 
  Square, 
  Maximize2,
  Move,
  AlertTriangle
} from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  onCancel?: () => void
  title: string
  children: React.ReactNode
  confirmText?: string
  cancelText?: string
  size?: "sm" | "md" | "lg" | "xl"
  draggable?: boolean
  onMinimize?: () => void
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  children,
  confirmText = "확인",
  cancelText = "취소",
  size = "md",
  draggable = true,
  onMinimize
}) => {
  const [position, setPosition] = React.useState(() => {
    // 초기 상태를 화면 중앙으로 설정 (lg 사이즈 기준)
    const initialWidth = 800 // lg 사이즈 기본값
    const initialHeight = 600 // 예상 높이
    return {
      x: Math.max(0, (window.innerWidth - initialWidth) / 2),
      y: Math.max(0, (window.innerHeight - initialHeight) / 2)
    }
  })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null)
  const [previousPosition, setPreviousPosition] = React.useState({ x: 0, y: 0 })
  const modalRef = React.useRef<HTMLDivElement>(null)
  const headerRef = React.useRef<HTMLDivElement>(null)
  
  // 드래그 중일 때 직접 DOM 조작을 위한 ref
  const isDraggingRef = React.useRef(false)
  const positionRef = React.useRef({
    x: Math.max(0, (window.innerWidth - 800) / 2),
    y: Math.max(0, (window.innerHeight - 600) / 2)
  })

  const sizeClasses = {
    sm: "w-[480px]",
    md: "w-[640px]",
    lg: "w-[800px]",
    xl: "w-[960px]"
  }

  // 모달을 화면 중앙에 위치시키는 함수
  const centerModal = React.useCallback(() => {
    if (modalRef.current) {
      // 모달이 렌더링된 후의 실제 크기를 가져오기 위해 강제로 리플로우
      modalRef.current.offsetHeight
      
      // sizeClasses에 따른 예상 크기 계산
      let expectedWidth = 640 // 기본값 (md)
      if (size === 'sm') expectedWidth = 480
      else if (size === 'md') expectedWidth = 640
      else if (size === 'lg') expectedWidth = 800
      else if (size === 'xl') expectedWidth = 960
      
      const centerX = (window.innerWidth - expectedWidth) / 2
      const centerY = (window.innerHeight - modalRef.current.offsetHeight) / 2
      
      const newPosition = { 
        x: Math.max(0, centerX), 
        y: Math.max(0, centerY) 
      }
      
      setPosition(newPosition)
      positionRef.current = newPosition
      
      // left/top 스타일로 직접 적용
      if (modalRef.current) {
        modalRef.current.style.left = `${newPosition.x}px`
        modalRef.current.style.top = `${newPosition.y}px`
      }
    }
  }, [size])

  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      // 복원 중이 아닐 때만 중앙 위치 계산
      const isRestoring = previousPosition.x > 0 || previousPosition.y > 0
      console.log('🔄 useEffect centerModal 호출됨 - isOpen:', isOpen, 'isMinimized:', isMinimized, 'isRestoring:', isRestoring)
      
      if (!isRestoring) {
        centerModal()
      }
    }
  }, [isOpen, isMinimized, centerModal, previousPosition])

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!draggable || !headerRef.current || isMinimized) return
    
    e.preventDefault()
    
    // 마우스 클릭 지점과 모달의 현재 위치 사이의 차이를 계산
    const currentX = positionRef.current.x
    const currentY = positionRef.current.y
    
    setDragOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY
    })
    setIsDragging(true)
    isDraggingRef.current = true
  }, [draggable, isMinimized])

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || isMinimized) return
    
    // CSS Transform을 사용한 즉시 반응 드래그
    if (modalRef.current) {
      const modalWidth = modalRef.current.offsetWidth
      const modalHeight = modalRef.current.offsetHeight
      
      // 드래그 제한을 완전히 제거하여 자유롭게 이동 가능
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // left/top으로 즉시 적용
      modalRef.current.style.left = `${newX}px`
      modalRef.current.style.top = `${newY}px`
      
      // ref 업데이트
      positionRef.current = { x: newX, y: newY }
    }
  }, [dragOffset.x, dragOffset.y, isMinimized])

  const handleMouseUp = React.useCallback(() => {
    if (isDraggingRef.current) {
      // 드래그 종료 시 상태 동기화
      setPosition(positionRef.current)
      setIsDragging(false)
      isDraggingRef.current = false
    }
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleMinimize = () => {
    // 최소화 전 현재 위치 저장 - position 상태 직접 사용
    console.log('🔍 최소화 전 현재 위치:', { x: position.x, y: position.y })
    console.log('🔍 positionRef.current:', { x: positionRef.current.x, y: positionRef.current.y })
    setPreviousPosition(position)
    setIsMinimized(true)
    if (onMinimize) {
      onMinimize()
    }
  }

  const handleRestore = () => {
    setIsMinimized(false)
    console.log('🔍 복원 시 previousPosition:', { x: previousPosition.x, y: previousPosition.y })
    console.log('🔍 조건 확인:', previousPosition.x > 0 || previousPosition.y > 0)
    
    // 즉시 이전 위치로 복원 (setTimeout 제거)
    if (previousPosition.x > 0 || previousPosition.y > 0) {
      // 이전 위치가 있으면 해당 위치로 복원
      console.log('✅ 이전 위치로 복원:', { x: previousPosition.x, y: previousPosition.y })
      setPosition(previousPosition)
      positionRef.current = previousPosition
      
      // left/top 스타일로 직접 적용
      if (modalRef.current) {
        console.log('🎯 DOM 스타일 적용:', { left: `${previousPosition.x}px`, top: `${previousPosition.y}px` })
        modalRef.current.style.left = `${previousPosition.x}px`
        modalRef.current.style.top = `${previousPosition.y}px`
        
        // 실제 적용된 스타일 확인
        setTimeout(() => {
          if (modalRef.current) {
            const actualLeft = modalRef.current.style.left
            const actualTop = modalRef.current.style.top
            console.log('🔍 실제 적용된 스타일:', { left: actualLeft, top: actualTop })
          }
        }, 100)
      }
    } else {
      // 이전 위치가 없으면 중앙으로 이동
      console.log('🔄 중앙으로 이동 (centerModal 호출)')
      centerModal()
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  // 경고 메시지 표시 및 액션 실행
  const showWarningAndExecute = (action: () => void) => {
    if (isMinimized) {
      setShowWarning(true)
      setPendingAction(() => action)
    } else {
      action()
    }
  }

  const handleConfirmWarning = () => {
    if (pendingAction) {
      pendingAction()
      setShowWarning(false)
      setPendingAction(null)
    }
  }

  const handleCancelWarning = () => {
    setShowWarning(false)
    setPendingAction(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                모달이 최소화되어 있습니다
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              현재 편집 중인 내용이 저장되지 않을 수 있습니다. 계속 진행하시겠습니까?
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelWarning}
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmWarning}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                계속 진행
              </Button>
            </div>
          </div>
        </div>
      )}

                           {/* Main Modal */}
        {/* 모달이 열려있을 때는 전체 화면을 덮지 않으면서 정상 크기 유지 */}
        <div className={`${isMinimized ? 'fixed bottom-4 right-4 z-10' : 'fixed z-50'}`}>
         
        {/* Modal */}
                 <div
           ref={modalRef}
           className={`
             bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700
             ${isMinimized 
               ? 'w-80 h-16 bottom-4 right-4 rounded-lg shadow-lg transition-all duration-500 ease-in-out' 
               : `${sizeClasses[size]} transition-transform duration-300 ease-out`
             }
           `}
                       style={{
              position: isMinimized ? 'fixed' : 'fixed',
              left: isMinimized ? 'auto' : `${position.x}px`,
              top: isMinimized ? 'auto' : `${position.y}px`,
              cursor: isDragging ? 'grabbing' : 'default',
              transform: isMinimized 
                ? 'scale(0.8)' 
                : 'none',
              opacity: isMinimized ? 0.9 : 1,
              transition: isDragging ? 'none' : undefined,
            }}
         >
          {/* Header */}
          <div
            ref={headerRef}
            className={`
              flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700
              ${draggable && !isMinimized ? 'cursor-move' : ''}
              ${isMinimized ? 'rounded-lg' : 'rounded-t-lg'}
              transition-all duration-300
            `}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center space-x-2">
              {!isMinimized && <Move className="w-4 h-4 text-gray-400" />}
              <h2 className={`font-semibold text-gray-900 dark:text-white transition-all duration-300 ${
                isMinimized ? 'text-sm' : 'text-lg'
              }`}>
                {title}
              </h2>
            </div>
            
            <div className="flex items-center space-x-1">
              {!isMinimized && (
                <Button
                  className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={handleMinimize}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              )}
              {isMinimized && (
                <Button
                  className="h-6 w-6 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all duration-200"
                  onClick={handleRestore}
                  title="창모드로 복원"
                >
                  <Square className="w-3 h-3" />
                </Button>
              )}
              <Button
                className={`hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-all duration-200 ${
                  isMinimized ? 'h-6 w-6' : 'h-8 w-8'
                }`}
                onClick={onClose}
              >
                <X className={isMinimized ? 'w-3 h-3' : 'w-4 h-4'} />
              </Button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="p-6 transition-all duration-300">
              {children}
            </div>
          )}

          {/* Footer */}
          {!isMinimized && (onConfirm || onCancel) && (
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
              {onCancel && (
                <Button
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
              )}
              {onConfirm && (
                <Button
                  onClick={handleConfirm}
                >
                  {confirmText}
                </Button>
              )}
            </div>
          )}

                     {/* Minimized Content Preview - 텍스트 및 아이콘 제거 */}
           {isMinimized && (
             <div className="px-4 py-2 transition-all duration-300">
               {/* 최소화된 상태에서는 내용 표시하지 않음 */}
             </div>
           )}
        </div>
      </div>

      {/* Minimized Bar - 클릭 이벤트만 처리 */}
      {isMinimized && (
        <div 
          className="fixed bottom-4 right-4 z-10 w-80 h-16 pointer-events-none"
          onClick={handleRestore}
        />
      )}
    </>
  )
}

export default Modal
